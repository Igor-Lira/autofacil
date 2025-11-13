/**
 * Cloud Function: processRefund
 *
 * Processes refund for cancelled booking.
 * Validates refund eligibility based on cancellation policy.
 * Returns funds via original payment method.
 *
 * Dependencies:
 * - Mercado Pago API (refund processing)
 * - Firestore
 * - Pub/Sub (async processing queue)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { RefundRequest, PaymentStatus } from '../types/payment.types';

export const processRefund = functions.https.onCall(
  async (data: RefundRequest, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const db = admin.firestore();

    try {
      // 1. Validate input
      if (!data.bookingId || !data.amount || !data.reason) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking ID, amount, and reason are required',
          400
        );
      }

      // 2. Get booking details
      const bookingDoc = await db.collection('bookings').doc(data.bookingId).get();

      if (!bookingDoc.exists) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'Booking not found',
          404
        );
      }

      const booking = bookingDoc.data();

      // 3. Verify booking is cancelled
      if (booking?.status !== 'cancelada') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Only cancelled bookings can be refunded',
          400
        );
      }

      // 4. Get payment record
      const paymentsSnapshot = await db
        .collection('payments')
        .where('bookingId', '==', data.bookingId)
        .where('status', '==', PaymentStatus.APROVADO)
        .limit(1)
        .get();

      if (paymentsSnapshot.empty) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'No approved payment found for this booking',
          404
        );
      }

      const paymentDoc = paymentsSnapshot.docs[0];
      const payment = paymentDoc.data();

      // 5. Validate refund amount
      if (data.amount > payment.amount) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Refund amount cannot exceed payment amount',
          400
        );
      }

      // 6. Check if already refunded
      const existingRefund = await db
        .collection('refunds')
        .where('bookingId', '==', data.bookingId)
        .where('status', '==', 'approved')
        .limit(1)
        .get();

      if (!existingRefund.empty) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking has already been refunded',
          400
        );
      }

      // 7. Process refund via Mercado Pago
      const refundResult = await processMercadoPagoRefund(
        payment.externalId,
        data.amount
      );

      // 8. Create refund record
      const refundRef = await db.collection('refunds').add({
        bookingId: data.bookingId,
        paymentId: paymentDoc.id,
        studentId: booking.studentId,
        amount: data.amount,
        reason: data.reason,
        status: 'approved',
        externalId: refundResult.refundId,
        method: payment.method,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 9. Update payment status
      await paymentDoc.ref.update({
        status: PaymentStatus.REEMBOLSADO,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
        refundAmount: data.amount
      });

      // 10. Send notification to student
      await db.collection('notifications').add({
        userId: booking.studentId,
        type: 'refund_processed',
        bookingId: data.bookingId,
        title: 'Reembolso Processado',
        body: `Seu reembolso de R$ ${data.amount.toFixed(2)} foi processado. Você receberá em 2-5 dias úteis.`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });

      // 11. Log refund
      console.log(`Refund processed: ${refundRef.id}`, {
        bookingId: data.bookingId,
        amount: data.amount,
        reason: data.reason
      });

      return {
        refundId: refundRef.id,
        amount: data.amount,
        status: 'approved',
        processingTime: '2-5 dias úteis',
        message: 'Reembolso processado com sucesso'
      };

    } catch (error) {
      console.error('Error processing refund:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to process refund',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Process refund via Mercado Pago
 */
async function processMercadoPagoRefund(
  paymentId: string,
  amount: number
): Promise<{ refundId: string; status: string }> {
  try {
    // TODO: Implement Mercado Pago refund API
    // const mercadopago = require('mercadopago');
    // mercadopago.configure({
    //   access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
    // });

    // const refund = await mercadopago.refund.create({
    //   payment_id: paymentId,
    //   amount: amount
    // });

    // Mock refund response
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`Mercado Pago refund processed: ${refundId} - R$ ${amount}`);

    return {
      refundId,
      status: 'approved'
    };

  } catch (error) {
    console.error('Mercado Pago refund failed:', error);
    throw new FunctionError(
      ErrorCodes.VALIDATION_ERROR,
      'Failed to process refund with payment provider',
      500
    );
  }
}

/**
 * Background function: Generate monthly fiscal reports
 * Runs on 1st of each month at 2am
 */
export const generateMonthlyReports = functions.pubsub
  .schedule('0 2 1 * *') // 2am on 1st of month
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const db = admin.firestore();
    const storage = admin.storage().bucket();

    try {
      // Calculate previous month range
      const now = new Date();
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      console.log(`Generating monthly report: ${firstDayLastMonth.toISOString()} to ${lastDayLastMonth.toISOString()}`);

      // Get all completed payments
      const paymentsSnapshot = await db
        .collection('payments')
        .where('status', '==', PaymentStatus.APROVADO)
        .where('paidAt', '>=', firstDayLastMonth)
        .where('paidAt', '<=', lastDayLastMonth)
        .get();

      // Aggregate data
      let totalRevenue = 0;
      let totalCommissions = 0;
      let totalPayouts = 0;
      const paymentsByDay: Record<string, number> = {};

      paymentsSnapshot.forEach(doc => {
        const payment = doc.data();
        totalRevenue += payment.amount;
        totalCommissions += payment.platformFee;
        totalPayouts += payment.instructorAmount;

        const date = payment.paidAt.toDate().toISOString().split('T')[0];
        paymentsByDay[date] = (paymentsByDay[date] || 0) + payment.amount;
      });

      // Get withdrawal data
      const withdrawalsSnapshot = await db
        .collection('withdrawals')
        .where('status', '==', 'completed')
        .where('processedAt', '>=', firstDayLastMonth)
        .where('processedAt', '<=', lastDayLastMonth)
        .get();

      let totalWithdrawals = 0;
      withdrawalsSnapshot.forEach(doc => {
        totalWithdrawals += doc.data().netAmount;
      });

      // Generate CSV report
      const csvRows = [
        'Data,Receita,Comissões,Pagamentos a Instrutores,Saques',
        ...Object.entries(paymentsByDay).map(([date, revenue]) =>
          `${date},${revenue},${revenue * 0.15},${revenue * 0.85},0`
        ),
        '',
        `TOTAL,${totalRevenue},${totalCommissions},${totalPayouts},${totalWithdrawals}`
      ];

      const csvContent = csvRows.join('\n');

      // Upload to Cloud Storage
      const fileName = `reports/fiscal-${firstDayLastMonth.getFullYear()}-${String(firstDayLastMonth.getMonth() + 1).padStart(2, '0')}.csv`;
      const file = storage.file(fileName);

      await file.save(csvContent, {
        contentType: 'text/csv',
        metadata: {
          cacheControl: 'public, max-age=31536000'
        }
      });

      console.log(`Monthly report generated: ${fileName}`);

      // Store report metadata
      await db.collection('fiscalReports').add({
        period: {
          start: firstDayLastMonth,
          end: lastDayLastMonth
        },
        metrics: {
          totalRevenue,
          totalCommissions,
          totalPayouts,
          totalWithdrawals,
          transactionCount: paymentsSnapshot.size
        },
        fileUrl: fileName,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // TODO: Send email to finance team
      console.log('Monthly fiscal report summary:', {
        totalRevenue,
        totalCommissions,
        totalPayouts,
        totalWithdrawals,
        transactions: paymentsSnapshot.size
      });

    } catch (error) {
      console.error('Error generating monthly report:', error);
    }
  });

