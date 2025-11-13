/**
 * Cloud Function: cancelBooking
 *
 * Cancels booking with refund logic based on cancellation policy:
 * - Student <24h: 100% refund (free cancellation)
 * - Student >24h: 50% refund (50% penalty)
 * - Instructor <12h: 100% penalty (full refund to student)
 * - Instructor >12h: No penalty
 *
 * Dependencies:
 * - Firestore
 * - Mercado Pago (refund processing)
 * - Pub/Sub (delayed refund queue)
 * - FCM (notifications)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import {
  BookingCancelRequest,
  BookingStatus,
  CancellationPolicy
} from '../types/booking.types';

export const cancelBooking = functions.https.onCall(
  async (data: BookingCancelRequest, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const userId = context.auth.uid;
    const db = admin.firestore();

    try {
      // 1. Validate input
      if (!data.bookingId || !data.userType) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking ID and user type are required',
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

      // 3. Verify user authorization
      if (data.userType === 'student' && booking?.studentId !== userId) {
        throw new FunctionError(
          ErrorCodes.UNAUTHORIZED,
          'Only the student can cancel this booking',
          403
        );
      }

      if (data.userType === 'instructor' && booking?.instructorId !== userId) {
        throw new FunctionError(
          ErrorCodes.UNAUTHORIZED,
          'Only the instructor can cancel this booking',
          403
        );
      }

      // 4. Check if already cancelled or completed
      if (booking.status === 'cancelada') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking is already cancelled',
          400
        );
      }

      if (booking.status === 'concluida') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Cannot cancel completed booking',
          400
        );
      }

      // 5. Calculate cancellation policy
      const bookingDate = booking.date.toDate();
      const now = new Date();
      const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      const policy = calculateCancellationPolicy(
        data.userType,
        hoursUntilBooking,
        booking.price,
        booking.depositAmount
      );

      // 6. Update booking status
      await db.collection('bookings').doc(data.bookingId).update({
        status: BookingStatus.CANCELADA,
        cancellationReason: data.reason || policy.reason,
        cancelledBy: data.userType,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        refundAmount: policy.refundPercentage * booking.price,
        penaltyAmount: policy.penaltyAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Release calendar slot
      const calendarSlotRef = db
        .collection('instructors')
        .doc(booking.instructorId)
        .collection('calendar')
        .doc(formatDateKey(bookingDate));

      await calendarSlotRef.update({
        reserved: false,
        bookingId: admin.firestore.FieldValue.delete(),
        releasedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 8. Process refund
      const refundAmount = Math.round(policy.refundPercentage * booking.price);

      if (refundAmount > 0) {
        await processRefund(
          data.bookingId,
          booking.studentId,
          refundAmount,
          policy.reason
        );
      }

      // 9. Apply penalty to instructor if applicable
      if (policy.penaltyAmount > 0 && data.userType === 'instructor') {
        await applyInstructorPenalty(
          booking.instructorId,
          policy.penaltyAmount,
          data.bookingId
        );
      }

      // 10. Send notifications
      const otherUserId = data.userType === 'student'
        ? booking.instructorId
        : booking.studentId;

      await sendCancellationNotification(
        otherUserId,
        data.bookingId,
        data.userType,
        policy
      );

      // 11. Log cancellation
      console.log(`Booking cancelled: ${data.bookingId}`, {
        cancelledBy: data.userType,
        hoursUntilBooking,
        refundAmount,
        penaltyAmount: policy.penaltyAmount
      });

      return {
        bookingId: data.bookingId,
        status: BookingStatus.CANCELADA,
        refundAmount,
        penaltyAmount: policy.penaltyAmount,
        processingTime: '2-5 dias úteis',
        message: policy.reason
      };

    } catch (error) {
      console.error('Error cancelling booking:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to cancel booking',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Calculate cancellation policy based on time and user type
 */
function calculateCancellationPolicy(
  userType: 'student' | 'instructor',
  hoursUntilBooking: number,
  totalPrice: number,
  depositAmount: number
): CancellationPolicy {

  if (userType === 'student') {
    // Student cancellation rules
    if (hoursUntilBooking < 24) {
      // Less than 24h before: free cancellation
      return {
        refundPercentage: 1.0, // 100% refund
        penaltyAmount: 0,
        reason: 'Cancelamento gratuito (menos de 24h antes da aula)'
      };
    } else {
      // More than 24h before: 50% penalty
      return {
        refundPercentage: 0.5, // 50% refund
        penaltyAmount: totalPrice * 0.5,
        reason: 'Cancelamento com multa de 50% (mais de 24h antes da aula)'
      };
    }
  } else {
    // Instructor cancellation rules
    if (hoursUntilBooking < 12) {
      // Less than 12h before: 100% penalty
      return {
        refundPercentage: 1.0, // 100% refund to student
        penaltyAmount: totalPrice, // Full penalty to instructor
        reason: 'Cancelamento pelo instrutor com menos de 12h (multa de 100%)'
      };
    } else {
      // More than 12h before: no penalty
      return {
        refundPercentage: 1.0, // 100% refund to student
        penaltyAmount: 0,
        reason: 'Cancelamento pelo instrutor sem multa'
      };
    }
  }
}

/**
 * Helper: Process refund
 */
async function processRefund(
  bookingId: string,
  studentId: string,
  amount: number,
  reason: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // TODO: Implement Mercado Pago refund API
    // const mercadopago = require('mercadopago');
    // await mercadopago.refund.create({
    //   payment_id: paymentId,
    //   amount: amount
    // });

    console.log(`Processing refund: R$ ${amount} for booking ${bookingId}`);

    await db.collection('refunds').add({
      bookingId,
      studentId,
      amount,
      reason,
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Refund processing failed:', error);
    throw new FunctionError(
      ErrorCodes.VALIDATION_ERROR,
      'Failed to process refund',
      500
    );
  }
}

/**
 * Helper: Apply penalty to instructor wallet
 */
async function applyInstructorPenalty(
  instructorId: string,
  penaltyAmount: number,
  bookingId: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // Deduct from instructor's wallet
    const walletRef = db.collection('instructors').doc(instructorId);

    await walletRef.update({
      'wallet.available': admin.firestore.FieldValue.increment(-penaltyAmount),
      'wallet.penalties': admin.firestore.FieldValue.increment(penaltyAmount)
    });

    // Record penalty transaction
    await db.collection('walletTransactions').add({
      userId: instructorId,
      type: 'penalty',
      amount: -penaltyAmount,
      description: `Multa por cancelamento - Aula #${bookingId}`,
      bookingId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Penalty applied to instructor ${instructorId}: R$ ${penaltyAmount}`);

  } catch (error) {
    console.error('Failed to apply penalty:', error);
    // Don't throw - refund should still process
  }
}

/**
 * Helper: Send cancellation notification
 */
async function sendCancellationNotification(
  userId: string,
  bookingId: string,
  cancelledBy: string,
  policy: CancellationPolicy
): Promise<void> {
  try {
    const db = admin.firestore();

    const title = cancelledBy === 'student'
      ? 'Aula Cancelada pelo Aluno'
      : 'Aula Cancelada pelo Instrutor';

    const body = policy.refundPercentage === 1.0
      ? 'Você receberá reembolso total em 2-5 dias úteis.'
      : `Você receberá reembolso de ${Math.round(policy.refundPercentage * 100)}% em 2-5 dias úteis.`;

    await db.collection('notifications').add({
      userId,
      type: 'booking_cancelled',
      bookingId,
      title,
      body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    // TODO: Send FCM push notification
    console.log(`Cancellation notification sent to ${userId}`);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Helper: Format date key
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}`;
}

