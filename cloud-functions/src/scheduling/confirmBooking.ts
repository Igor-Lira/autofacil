/**
 * Cloud Function: confirmBooking
 *
 * Instructor confirms booking within 2 hours.
 * Updates status to "confirmada" and schedules remaining 80% payment.
 *
 * Dependencies:
 * - Firestore
 * - FCM (push notifications)
 * - Mercado Pago API (payment intent update)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { BookingConfirmRequest, BookingStatus } from '../types/booking.types';

export const confirmBooking = functions.https.onCall(
  async (data: BookingConfirmRequest, context) => {
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
      if (!data.bookingId) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking ID is required',
          400
        );
      }

      // 2. Get booking
      const bookingDoc = await db.collection('bookings').doc(data.bookingId).get();

      if (!bookingDoc.exists) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'Booking not found',
          404
        );
      }

      const booking = bookingDoc.data();

      // 3. Verify instructor ownership
      if (booking?.instructorId !== instructorId) {
        throw new FunctionError(
          ErrorCodes.UNAUTHORIZED,
          'Only the assigned instructor can confirm this booking',
          403
        );
      }

      // 4. Check if already confirmed or cancelled
      if (booking.status !== 'pendente') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          `Booking is already ${booking.status}`,
          400
        );
      }

      // 5. Check if within 2-hour acceptance window
      const createdAt = booking.createdAt.toDate();
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation > 2) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Acceptance window expired (2 hours)',
          403
        );
      }

      // 6. Update booking status
      await db.collection('bookings').doc(data.bookingId).update({
        status: BookingStatus.CONFIRMADA,
        confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Update payment intent (schedule remaining 80% charge post-lesson)
      await updatePaymentIntent(data.bookingId, booking.remainingAmount);

      // 8. Cancel timeout job
      await cancelTimeoutJob(data.bookingId);

      // 9. Send notification to student
      await db.collection('notifications').add({
        userId: booking.studentId,
        type: 'booking_confirmed',
        bookingId: data.bookingId,
        title: 'Aula Confirmada!',
        body: `Sua aula foi confirmada. Prepare-se para ${new Date(booking.date.toDate()).toLocaleDateString('pt-BR')}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });

      // 10. Log confirmation
      console.log(`Booking confirmed: ${data.bookingId}`, {
        instructorId,
        studentId: booking.studentId
      });

      return {
        bookingId: data.bookingId,
        status: BookingStatus.CONFIRMADA,
        message: 'Booking confirmed successfully'
      };

    } catch (error) {
      console.error('Error confirming booking:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to confirm booking',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Update payment intent for remaining amount
 */
async function updatePaymentIntent(bookingId: string, remainingAmount: number): Promise<void> {
  try {
    // TODO: Implement Mercado Pago payment intent update
    console.log(`Payment intent updated for booking ${bookingId}: R$ ${remainingAmount}`);

    const db = admin.firestore();
    await db.collection('paymentIntents').add({
      bookingId,
      amount: remainingAmount,
      type: 'remaining_payment',
      status: 'scheduled',
      chargeAfter: 'lesson_completion',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Failed to update payment intent:', error);
    // Don't throw - booking confirmation should succeed
  }
}

/**
 * Helper: Cancel timeout job
 */
async function cancelTimeoutJob(bookingId: string): Promise<void> {
  try {
    const db = admin.firestore();

    const timeoutQuery = await db
      .collection('bookingTimeouts')
      .where('bookingId', '==', bookingId)
      .where('processed', '==', false)
      .get();

    const batch = db.batch();
    timeoutQuery.docs.forEach(doc => {
      batch.update(doc.ref, { processed: true, cancelled: true });
    });

    await batch.commit();
    console.log(`Timeout job cancelled for booking ${bookingId}`);

  } catch (error) {
    console.error('Failed to cancel timeout job:', error);
  }
}

