/**
 * Cloud Function: handlePaymentWebhook
 *
 * Listens to Mercado Pago webhooks for payment status updates.
 * Updates booking payment status and triggers payment release flow on success.
 *
 * Dependencies:
 * - Mercado Pago API (fetch payment details)
 * - Firestore
 * - Pub/Sub (retry queue)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { MercadoPagoWebhook, PaymentStatus } from '../types/payment.types';

export const handlePaymentWebhook = functions.https.onRequest(
  async (req, res) => {
    const db = admin.firestore();

    try {
      // 1. Validate webhook signature (security)
      const signature = req.headers['x-signature'] as string;
      const requestId = req.headers['x-request-id'] as string;

      if (!validateWebhookSignature(signature, req.body)) {
        console.error('Invalid webhook signature');
        res.status(403).send('Invalid signature');
        return;
      }

      // 2. Parse webhook data
      const webhookData: MercadoPagoWebhook = req.body;

      // 3. Only process payment events
      if (webhookData.type !== 'payment') {
        res.status(200).send('OK - Not a payment event');
        return;
      }

      const paymentId = webhookData.data.id;

      // 4. Check for duplicate processing (idempotency)
      const existingWebhook = await db
        .collection('webhookEvents')
        .where('requestId', '==', requestId)
        .limit(1)
        .get();

      if (!existingWebhook.empty) {
        console.log(`Webhook already processed: ${requestId}`);
        res.status(200).send('OK - Already processed');
        return;
      }

      // 5. Fetch payment details from Mercado Pago
      const paymentDetails = await fetchPaymentDetails(paymentId);

      // 6. Update payment record in Firestore
      const paymentQuery = await db
        .collection('payments')
        .where('externalId', '==', paymentId)
        .limit(1)
        .get();

      if (paymentQuery.empty) {
        console.error(`Payment not found: ${paymentId}`);
        res.status(404).send('Payment not found');
        return;
      }

      const paymentDoc = paymentQuery.docs[0];
      const payment = paymentDoc.data();

      // 7. Update payment status based on Mercado Pago status
      const newStatus = mapMercadoPagoStatus(paymentDetails.status);

      await paymentDoc.ref.update({
        status: newStatus,
        externalStatus: paymentDetails.status,
        paidAt: newStatus === PaymentStatus.APROVADO
          ? admin.firestore.FieldValue.serverTimestamp()
          : null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 8. Update booking payment status
      await db.collection('bookings').doc(payment.bookingId).update({
        paymentStatus: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 9. Send notification based on status
      if (newStatus === PaymentStatus.APROVADO) {
        await handlePaymentApproved(payment.bookingId, payment.studentId);
      } else if (newStatus === PaymentStatus.REJEITADO) {
        await handlePaymentRejected(payment.bookingId, payment.studentId);
      }

      // 10. Store webhook event for audit
      await db.collection('webhookEvents').add({
        requestId,
        type: webhookData.type,
        action: webhookData.action,
        paymentId,
        status: paymentDetails.status,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 11. Log webhook processing
      console.log(`Webhook processed: ${requestId}`, {
        paymentId,
        status: paymentDetails.status,
        newStatus
      });

      res.status(200).send('OK');

    } catch (error) {
      console.error('Webhook processing error:', error);

      // Queue for retry if processing fails
      try {
        await db.collection('webhookRetryQueue').add({
          webhookData: req.body,
          error: error.message,
          attempts: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (queueError) {
        console.error('Failed to queue webhook for retry:', queueError);
      }

      res.status(500).send('Error processing webhook');
    }
  }
);

/**
 * Helper: Validate webhook signature using HMAC
 */
function validateWebhookSignature(signature: string, payload: any): boolean {
  try {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || 'test_secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature || ''),
      Buffer.from(hmac)
    );
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Helper: Fetch payment details from Mercado Pago
 */
async function fetchPaymentDetails(paymentId: string): Promise<any> {
  try {
    // TODO: Implement Mercado Pago API call
    // const axios = require('axios');
    // const response = await axios.get(
    //   `https://api.mercadopago.com/v1/payments/${paymentId}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
    //     }
    //   }
    // );
    // return response.data;

    // Mock payment details
    return {
      id: paymentId,
      status: 'approved',
      status_detail: 'accredited',
      transaction_amount: 140,
      date_approved: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw new Error('Failed to fetch payment from Mercado Pago');
  }
}

/**
 * Helper: Map Mercado Pago status to internal status
 */
function mapMercadoPagoStatus(mpStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    'approved': PaymentStatus.APROVADO,
    'pending': PaymentStatus.PENDENTE,
    'in_process': PaymentStatus.PENDENTE,
    'rejected': PaymentStatus.REJEITADO,
    'cancelled': PaymentStatus.REJEITADO,
    'refunded': PaymentStatus.REEMBOLSADO,
    'charged_back': PaymentStatus.REEMBOLSADO
  };

  return statusMap[mpStatus] || PaymentStatus.PENDENTE;
}

/**
 * Helper: Handle payment approved
 */
async function handlePaymentApproved(
  bookingId: string,
  studentId: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // Send notification to student
    await db.collection('notifications').add({
      userId: studentId,
      type: 'payment_confirmed',
      bookingId,
      title: 'Pagamento Confirmado!',
      body: 'Seu pagamento foi aprovado. Aguarde a confirmação do instrutor.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    // Get booking to notify instructor
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    const booking = bookingDoc.data();

    if (booking) {
      await db.collection('notifications').add({
        userId: booking.instructorId,
        type: 'payment_received',
        bookingId,
        title: 'Pagamento Recebido',
        body: 'O aluno efetuou o pagamento. Confirme a aula em até 2 horas!',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });
    }

    console.log(`Payment approved notifications sent for booking ${bookingId}`);

  } catch (error) {
    console.error('Failed to send payment approved notifications:', error);
  }
}

/**
 * Helper: Handle payment rejected
 */
async function handlePaymentRejected(
  bookingId: string,
  studentId: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // Send notification to student
    await db.collection('notifications').add({
      userId: studentId,
      type: 'payment_failed',
      bookingId,
      title: 'Pagamento Recusado',
      body: 'Seu pagamento foi recusado. Tente novamente com outro método.',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    console.log(`Payment rejected notification sent for booking ${bookingId}`);

  } catch (error) {
    console.error('Failed to send payment rejected notifications:', error);
  }
}

/**
 * Background function: Retry failed webhook processing
 */
export const retryFailedWebhooks = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Get webhooks that need retry (max 3 attempts)
      const retryQueue = await db
        .collection('webhookRetryQueue')
        .where('attempts', '<', 3)
        .limit(20)
        .get();

      console.log(`Retrying ${retryQueue.size} failed webhooks`);

      for (const retryDoc of retryQueue.docs) {
        const retry = retryDoc.data();

        try {
          // Process webhook data
          const webhookData = retry.webhookData;
          const paymentId = webhookData.data.id;

          // Fetch and update payment
          const paymentDetails = await fetchPaymentDetails(paymentId);
          const newStatus = mapMercadoPagoStatus(paymentDetails.status);

          const paymentQuery = await db
            .collection('payments')
            .where('externalId', '==', paymentId)
            .limit(1)
            .get();

          if (!paymentQuery.empty) {
            const paymentDoc = paymentQuery.docs[0];
            await paymentDoc.ref.update({
              status: newStatus,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Delete from retry queue (success)
            await retryDoc.ref.delete();
            console.log(`Webhook retry successful: ${paymentId}`);
          }

        } catch (error) {
          // Increment attempt count
          await retryDoc.ref.update({
            attempts: admin.firestore.FieldValue.increment(1),
            lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
            lastError: error.message
          });

          console.error(`Webhook retry failed: ${retry.webhookData.data.id}`, error);
        }
      }

    } catch (error) {
      console.error('Error processing webhook retry queue:', error);
    }
  });

