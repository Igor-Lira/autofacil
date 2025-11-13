/**
 * Cloud Function: rescheduleBooking
 *
 * Student reschedules booking once for free.
 * Subsequent reschedules trigger a 10% fee.
 *
 * Dependencies:
 * - Firestore (transaction on calendar/booking)
 * - Mercado Pago API (fee collection)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { BookingRescheduleRequest } from '../types/booking.types';

export const rescheduleBooking = functions.https.onCall(
  async (data: BookingRescheduleRequest, context) => {
    if (!context.auth) {
      throw new FunctionError(
        ErrorCodes.UNAUTHORIZED,
        'User must be authenticated',
        401
      );
    }

    const studentId = context.auth.uid;
    const db = admin.firestore();

    try {
      // 1. Validate input
      if (!data.bookingId || !data.newDate) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking ID and new date are required',
          400
        );
      }

      const newBookingDate = new Date(data.newDate);
      const now = new Date();

      if (newBookingDate <= now) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'New date must be in the future',
          400
        );
      }

      // 2. Execute reschedule with transaction
      const result = await db.runTransaction(async (transaction) => {
        // Get current booking
        const bookingRef = db.collection('bookings').doc(data.bookingId);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists) {
          throw new FunctionError(
            ErrorCodes.NOT_FOUND,
            'Booking not found',
            404
          );
        }

        const booking = bookingDoc.data();

        // Verify student ownership
        if (booking?.studentId !== studentId) {
          throw new FunctionError(
            ErrorCodes.UNAUTHORIZED,
            'Only the student can reschedule this booking',
            403
          );
        }

        // Check booking status
        if (booking.status !== 'pendente' && booking.status !== 'confirmada') {
          throw new FunctionError(
            ErrorCodes.VALIDATION_ERROR,
            'Only pending or confirmed bookings can be rescheduled',
            400
          );
        }

        // Calculate fee (first reschedule free, subsequent 10%)
        const rescheduleCount = booking.rescheduleCount || 0;
        const fee = rescheduleCount > 0 ? Math.round(booking.price * 0.1) : 0;

        // Check new slot availability
        const existingBookingsRef = db
          .collection('bookings')
          .where('instructorId', '==', booking.instructorId)
          .where('date', '==', admin.firestore.Timestamp.fromDate(newBookingDate))
          .where('status', 'in', ['pendente', 'confirmada']);

        const existingBookings = await transaction.get(existingBookingsRef);

        if (!existingBookings.empty) {
          throw new FunctionError(
            ErrorCodes.VALIDATION_ERROR,
            'New time slot is not available',
            409
          );
        }

        // Release old calendar slot
        const oldCalendarSlotRef = db
          .collection('instructors')
          .doc(booking.instructorId)
          .collection('calendar')
          .doc(formatDateKey(booking.date.toDate()));

        transaction.update(oldCalendarSlotRef, {
          reserved: false,
          bookingId: admin.firestore.FieldValue.delete()
        });

        // Reserve new calendar slot
        const newCalendarSlotRef = db
          .collection('instructors')
          .doc(booking.instructorId)
          .collection('calendar')
          .doc(formatDateKey(newBookingDate));

        transaction.set(
          newCalendarSlotRef,
          {
            date: newBookingDate,
            reserved: true,
            bookingId: data.bookingId,
            reservedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );

        // Update booking
        const updates: any = {
          date: admin.firestore.Timestamp.fromDate(newBookingDate),
          rescheduleCount: rescheduleCount + 1,
          lastRescheduledAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (data.newDuration) {
          updates.duration = data.newDuration;
          updates.price = booking.pricePerHour * data.newDuration;
        }

        if (fee > 0) {
          updates.rescheduleFee = fee;
          updates.totalPrice = (updates.price || booking.price) + fee;
        }

        transaction.update(bookingRef, updates);

        return {
          bookingId: data.bookingId,
          newDate: newBookingDate.toISOString(),
          fee,
          rescheduleCount: rescheduleCount + 1
        };
      });

      // 3. Charge reschedule fee if applicable
      if (result.fee > 0) {
        await chargeRescheduleFee(data.bookingId, studentId, result.fee);
      }

      // 4. Notify instructor of reschedule
      const bookingDoc = await db.collection('bookings').doc(data.bookingId).get();
      const booking = bookingDoc.data();

      await db.collection('notifications').add({
        userId: booking?.instructorId,
        type: 'booking_rescheduled',
        bookingId: data.bookingId,
        title: 'Aula Reagendada',
        body: `O aluno reagendou a aula para ${newBookingDate.toLocaleDateString('pt-BR')}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      });

      // 5. Log reschedule
      console.log(`Booking rescheduled: ${data.bookingId}`, {
        oldDate: booking?.date.toDate().toISOString(),
        newDate: result.newDate,
        fee: result.fee
      });

      return {
        bookingId: data.bookingId,
        newDate: result.newDate,
        fee: result.fee,
        message: result.fee > 0
          ? `Reagendamento realizado. Taxa de 10%: R$ ${result.fee}`
          : 'Reagendamento gratuito realizado'
      };

    } catch (error) {
      console.error('Error rescheduling booking:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to reschedule booking',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Charge reschedule fee
 */
async function chargeRescheduleFee(
  bookingId: string,
  studentId: string,
  fee: number
): Promise<void> {
  try {
    // TODO: Implement Mercado Pago charge
    console.log(`Charging reschedule fee: R$ ${fee} for booking ${bookingId}`);

    const db = admin.firestore();
    await db.collection('payments').add({
      bookingId,
      studentId,
      amount: fee,
      type: 'reschedule_fee',
      status: 'pendente',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Failed to charge reschedule fee:', error);
    // Don't throw - reschedule already completed
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

