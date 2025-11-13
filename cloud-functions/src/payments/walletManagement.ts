/**
 * Cloud Function: requestWithdrawal
 *
 * Instructor requests withdrawal from wallet (min R$100).
 * For PIX: processes instantly (R$2 fee).
 * For TED: queues for 1-2 business days.
 *
 * Dependencies:
 * - Firestore
 * - Mercado Pago API (payout processing)
 * - Pub/Sub (TED batch queue)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import {
  WithdrawalRequest,
  WithdrawalMethod,
  TransactionType,
  TransactionStatus
} from '../types/payment.types';

export const requestWithdrawal = functions.https.onCall(
  async (data: WithdrawalRequest, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const instructorId = context.auth.uid;
    const db = admin.firestore();

    try {
      // 1. Validate input
      if (!data.amount || !data.method) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Amount and withdrawal method are required',
          400
        );
      }

      // Validate minimum amount (R$100)
      if (data.amount < 100) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Minimum withdrawal amount is R$ 100',
          400
        );
      }

      // Validate method-specific requirements
      if (data.method === WithdrawalMethod.PIX && !data.pixKey) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'PIX key is required for PIX withdrawals',
          400
        );
      }

      if (data.method === WithdrawalMethod.TED && !data.bankAccount) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Bank account details are required for TED withdrawals',
          400
        );
      }

      // 2. Get instructor wallet
      const instructorDoc = await db
        .collection('instructors')
        .doc(instructorId)
        .get();

      if (!instructorDoc.exists) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'Instructor not found',
          404
        );
      }

      const instructor = instructorDoc.data();
      const wallet = instructor?.wallet || { available: 0, blocked: 0, total: 0 };

      // 3. Check available balance
      if (wallet.available < data.amount) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Insufficient available balance',
          400,
          {
            available: wallet.available,
            requested: data.amount
          }
        );
      }

      // 4. Calculate fees
      const fee = data.method === WithdrawalMethod.PIX ? 2 : 0;
      const netAmount = data.amount - fee;

      // 5. Process withdrawal in transaction
      const withdrawalId = await db.runTransaction(async (transaction) => {
        // Update wallet (block amount during processing)
        const instructorRef = db.collection('instructors').doc(instructorId);

        transaction.update(instructorRef, {
          'wallet.available': admin.firestore.FieldValue.increment(-data.amount),
          'wallet.blocked': admin.firestore.FieldValue.increment(data.amount)
        });

        // Create withdrawal record
        const withdrawalRef = db.collection('withdrawals').doc();
        transaction.set(withdrawalRef, {
          instructorId,
          amount: data.amount,
          fee,
          netAmount,
          method: data.method,
          pixKey: data.pixKey || null,
          bankAccount: data.bankAccount || null,
          status: 'processing',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return withdrawalRef.id;
      });

      // 6. Process based on method
      if (data.method === WithdrawalMethod.PIX) {
        // PIX: Process immediately
        await processPixWithdrawal(withdrawalId, instructorId, netAmount, data.pixKey!);
      } else {
        // TED: Queue for batch processing
        await queueTEDWithdrawal(withdrawalId, instructorId, netAmount, data.bankAccount!);
      }

      // 7. Calculate estimated date
      const estimatedDate = data.method === WithdrawalMethod.PIX
        ? new Date() // Instant
        : calculateBusinessDays(new Date(), 2); // 1-2 business days

      // 8. Log withdrawal request
      console.log(`Withdrawal requested: ${withdrawalId}`, {
        instructorId,
        amount: data.amount,
        method: data.method,
        fee
      });

      return {
        withdrawalId,
        status: 'processing',
        amount: data.amount,
        fee,
        netAmount,
        estimatedDate: estimatedDate.toISOString(),
        message: data.method === WithdrawalMethod.PIX
          ? 'Saque via PIX processado. Você receberá em instantes.'
          : 'Saque via TED agendado. Você receberá em 1-2 dias úteis.'
      };

    } catch (error) {
      console.error('Error processing withdrawal:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to process withdrawal',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Process PIX withdrawal (instant)
 */
async function processPixWithdrawal(
  withdrawalId: string,
  instructorId: string,
  amount: number,
  pixKey: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // TODO: Implement Mercado Pago payout API
    // const mercadopago = require('mercadopago');
    // const payout = await mercadopago.payout.create({
    //   amount: amount,
    //   destination_key: pixKey,
    //   description: `Saque AutoFacil - ${withdrawalId}`
    // });

    console.log(`Processing PIX withdrawal: ${withdrawalId} - R$ ${amount} to ${pixKey}`);

    // Simulate instant processing
    await db.collection('withdrawals').doc(withdrawalId).update({
      status: 'completed',
      externalId: `mp_payout_${Date.now()}`,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Unblock amount from wallet (move from blocked to withdrawn)
    await db.collection('instructors').doc(instructorId).update({
      'wallet.blocked': admin.firestore.FieldValue.increment(-amount),
      'wallet.total': admin.firestore.FieldValue.increment(-amount)
    });

    // Create wallet transaction
    await db.collection('walletTransactions').add({
      userId: instructorId,
      type: TransactionType.WITHDRAWAL,
      amount: -amount,
      description: `Saque via PIX - ${pixKey}`,
      withdrawalId,
      status: TransactionStatus.CONCLUIDO,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send notification
    await db.collection('notifications').add({
      userId: instructorId,
      type: 'withdrawal_completed',
      title: 'Saque Processado',
      body: `Saque de R$ ${amount.toFixed(2)} via PIX concluído com sucesso!`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

  } catch (error) {
    console.error('PIX withdrawal failed:', error);

    // Rollback wallet on failure
    const db = admin.firestore();
    await db.collection('instructors').doc(instructorId).update({
      'wallet.available': admin.firestore.FieldValue.increment(amount),
      'wallet.blocked': admin.firestore.FieldValue.increment(-amount)
    });

    await db.collection('withdrawals').doc(withdrawalId).update({
      status: 'failed',
      error: error.message,
      failedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    throw error;
  }
}

/**
 * Helper: Queue TED withdrawal for batch processing
 */
async function queueTEDWithdrawal(
  withdrawalId: string,
  instructorId: string,
  amount: number,
  bankAccount: any
): Promise<void> {
  try {
    const db = admin.firestore();

    // Add to TED batch queue (processed daily)
    await db.collection('tedBatchQueue').add({
      withdrawalId,
      instructorId,
      amount,
      bankAccount,
      scheduledFor: calculateBusinessDays(new Date(), 1), // Next business day
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });

    console.log(`TED withdrawal queued: ${withdrawalId}`);

  } catch (error) {
    console.error('Failed to queue TED withdrawal:', error);
    throw error;
  }
}

/**
 * Helper: Calculate business days (skip weekends)
 */
function calculateBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Background function: Process TED batch queue
 * Runs daily at 9am to process TED withdrawals
 */
export const processTEDBatch = functions.pubsub
  .schedule('0 9 * * 1-5') // Monday-Friday at 9am
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    try {
      // Get TED withdrawals scheduled for today or earlier
      const tedQueue = await db
        .collection('tedBatchQueue')
        .where('scheduledFor', '<=', now)
        .where('processed', '==', false)
        .limit(100)
        .get();

      console.log(`Processing ${tedQueue.size} TED withdrawals`);

      for (const tedDoc of tedQueue.docs) {
        const ted = tedDoc.data();

        try {
          // TODO: Implement bank TED API or Mercado Pago transfer
          console.log(`Processing TED: ${ted.withdrawalId} - R$ ${ted.amount}`);

          // Update withdrawal status
          await db.collection('withdrawals').doc(ted.withdrawalId).update({
            status: 'completed',
            processedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Unblock amount from wallet
          await db.collection('instructors').doc(ted.instructorId).update({
            'wallet.blocked': admin.firestore.FieldValue.increment(-ted.amount),
            'wallet.total': admin.firestore.FieldValue.increment(-ted.amount)
          });

          // Create wallet transaction
          await db.collection('walletTransactions').add({
            userId: ted.instructorId,
            type: TransactionType.WITHDRAWAL,
            amount: -ted.amount,
            description: `Saque via TED - ${ted.bankAccount.bank}`,
            withdrawalId: ted.withdrawalId,
            status: TransactionStatus.CONCLUIDO,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            processedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Send notification
          await db.collection('notifications').add({
            userId: ted.instructorId,
            type: 'withdrawal_completed',
            title: 'Saque Concluído',
            body: `Saque de R$ ${ted.amount.toFixed(2)} via TED processado!`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          });

          // Mark as processed
          await tedDoc.ref.update({ processed: true });

        } catch (error) {
          console.error(`TED processing failed: ${ted.withdrawalId}`, error);

          // Update withdrawal with error
          await db.collection('withdrawals').doc(ted.withdrawalId).update({
            status: 'failed',
            error: error.message,
            failedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

    } catch (error) {
      console.error('Error processing TED batch:', error);
    }
  });

/**
 * Cloud Function: getWallet
 * Get instructor wallet information
 */
export const getWallet = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const instructorId = context.auth.uid;
    const db = admin.firestore();

    try {
      // Get instructor wallet
      const instructorDoc = await db
        .collection('instructors')
        .doc(instructorId)
        .get();

      if (!instructorDoc.exists) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'Instructor not found',
          404
        );
      }

      const instructor = instructorDoc.data();
      const wallet = instructor?.wallet || {
        available: 0,
        blocked: 0,
        total: 0,
        penalties: 0
      };

      // Get recent transactions (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const transactionsSnapshot = await db
        .collection('walletTransactions')
        .where('userId', '==', instructorId)
        .where('createdAt', '>', thirtyDaysAgo)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        available: wallet.available,
        blocked: wallet.blocked,
        total: wallet.total,
        penalties: wallet.penalties || 0,
        history: transactions
      };

    } catch (error) {
      console.error('Error getting wallet:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to get wallet information',
        { originalError: error.message }
      );
    }
  }
);

