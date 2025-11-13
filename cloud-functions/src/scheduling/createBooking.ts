/**
 * Cloud Function: createBooking
 *
 * Creates a booking with atomic lock to prevent double-booking.
 * Validates availability and processes 20% deposit payment.
 *
 * Key Features:
 * - Firestore transaction with atomic lock
 * - Slot validation in real-time
 * - 20% deposit via PIX (Mercado Pago)
 * - 2-hour acceptance window with Pub/Sub timeout
 *
 * Dependencies:
 * - Firestore (transactions with locks)
 * - Mercado Pago (PIX QR Code generation)
 * - Pub/Sub (timeout queue for 2h acceptance window)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import {
  BookingCreateRequest,
  Booking,
  BookingStatus,
  PaymentStatus
} from '../types/booking.types';

export const createBooking = functions.https.onCall(
  async (data: BookingCreateRequest, context) => {
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
      if (!data.instructorId || !data.date || !data.duration) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Instructor ID, date, and duration are required',
          400
        );
      }

      // Validate duration (1-4 hours)
      if (data.duration < 1 || data.duration > 4) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Duration must be between 1 and 4 hours',
          400
        );
      }

      // 2. Validate booking date (must be in future)
      const bookingDate = new Date(data.date);
      const now = new Date();

      if (bookingDate <= now) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking date must be in the future',
          400
        );
      }

      // 3. Get instructor details
      const instructorDoc = await db
        .collection('instructors')
        .doc(data.instructorId)
        .get();

      if (!instructorDoc.exists) {
        throw new FunctionError(
          ErrorCodes.NOT_FOUND,
          'Instructor not found',
          404
        );
      }

      const instructor = instructorDoc.data();

      if (instructor?.status !== 'aprovado') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Instructor is not approved',
          400
        );
      }

      // 4. Calculate pricing
      const pricePerHour = instructor.pricePerHour || 80;
      const totalPrice = pricePerHour * data.duration;
      const depositAmount = Math.round(totalPrice * 0.2); // 20% deposit
      const remainingAmount = totalPrice - depositAmount;

      // 5. Create booking with atomic transaction (prevent double-booking)
      const bookingId = await db.runTransaction(async (transaction) => {
        // Check for existing bookings at this time
        const existingBookingsRef = db
          .collection('bookings')
          .where('instructorId', '==', data.instructorId)
          .where('date', '==', admin.firestore.Timestamp.fromDate(bookingDate))
          .where('status', 'in', ['pendente', 'confirmada']);

        const existingBookings = await transaction.get(existingBookingsRef);

        if (!existingBookings.empty) {
          throw new FunctionError(
            ErrorCodes.VALIDATION_ERROR,
            'This time slot is already booked',
            409
          );
        }

        // Lock calendar slot
        const calendarSlotRef = db
          .collection('instructors')
          .doc(data.instructorId)
          .collection('calendar')
          .doc(formatDateKey(bookingDate));

        const calendarSlot = await transaction.get(calendarSlotRef);

        if (calendarSlot.exists && calendarSlot.data()?.reserved) {
          throw new FunctionError(
            ErrorCodes.VALIDATION_ERROR,
            'Calendar slot is reserved',
            409
          );
        }

        // Create booking document
        const bookingRef = db.collection('bookings').doc();
        const booking: Partial<Booking> = {
          studentId,
          instructorId: data.instructorId,
          date: bookingDate,
          duration: data.duration,
          location: data.location,
          category: data.category,
          focus: data.focus,
          status: BookingStatus.PENDENTE,
          paymentStatus: PaymentStatus.PENDENTE,
          rescheduleCount: 0,
          price: totalPrice,
          depositAmount,
          remainingAmount,
          createdAt: new Date()
        };

        transaction.set(bookingRef, booking);

        // Reserve calendar slot
        transaction.set(
          calendarSlotRef,
          {
            date: bookingDate,
            reserved: true,
            bookingId: bookingRef.id,
            reservedAt: admin.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );

        return bookingRef.id;
      });

      // 6. Process deposit payment (20% via PIX)
      const paymentResult = await processDepositPayment(
        bookingId,
        studentId,
        depositAmount
      );

      // 7. Update booking with payment info
      await db.collection('bookings').doc(bookingId).update({
        paymentId: paymentResult.paymentId,
        paymentQRCode: paymentResult.qrCode,
        paymentExpiresAt: paymentResult.expiresAt
      });

      // 8. Schedule timeout job (2 hours for instructor to accept)
      await scheduleAcceptanceTimeout(bookingId, 2 * 60 * 60 * 1000); // 2 hours

      // 9. Send notification to instructor
      await sendBookingNotification(data.instructorId, bookingId, 'new_booking');

      // 10. Log booking creation
      console.log(`Booking created: ${bookingId}`, {
        studentId,
        instructorId: data.instructorId,
        date: bookingDate.toISOString(),
        price: totalPrice
      });

      return {
        bookingId,
        status: BookingStatus.PENDENTE,
        paymentQRCode: paymentResult.qrCode,
        paymentQRCodeUrl: paymentResult.qrCodeUrl,
        expiresAt: paymentResult.expiresAt,
        depositAmount,
        totalPrice,
        message: 'Booking created. Waiting for instructor confirmation.'
      };

    } catch (error) {
      console.error('Error creating booking:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to create booking',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Process deposit payment via PIX
 */
async function processDepositPayment(
  bookingId: string,
  studentId: string,
  amount: number
): Promise<{
  paymentId: string;
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
}> {
  try {
    // TODO: Implement Mercado Pago SDK integration
    // const mercadopago = require('mercadopago');
    // mercadopago.configure({
    //   access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
    // });

    // const payment = await mercadopago.payment.create({
    //   transaction_amount: amount,
    //   description: `Depósito aula #${bookingId}`,
    //   payment_method_id: 'pix',
    //   payer: {
    //     email: studentEmail
    //   }
    // });

    // Mock payment response
    const paymentId = `pay_${Date.now()}`;
    const qrCode = `00020126580014br.gov.bcb.pix0136${paymentId}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store payment in Firestore
    await admin.firestore().collection('payments').doc(paymentId).set({
      bookingId,
      studentId,
      amount,
      type: 'deposit',
      method: 'pix',
      status: 'pendente',
      qrCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(expiresAt))
    });

    return {
      paymentId,
      qrCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}`,
      expiresAt
    };
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw new FunctionError(
      ErrorCodes.VALIDATION_ERROR,
      'Failed to process payment',
      500
    );
  }
}

/**
 * Helper: Schedule acceptance timeout (2 hours)
 */
async function scheduleAcceptanceTimeout(
  bookingId: string,
  delayMs: number
): Promise<void> {
  try {
    const db = admin.firestore();

    // Store timeout job in Firestore for Pub/Sub trigger
    await db.collection('bookingTimeouts').add({
      bookingId,
      type: 'acceptance_timeout',
      scheduledFor: new Date(Date.now() + delayMs),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });

    console.log(`Acceptance timeout scheduled for booking ${bookingId}`);
  } catch (error) {
    console.error('Failed to schedule timeout:', error);
    // Don't throw - booking already created
  }
}

/**
 * Helper: Send booking notification
 */
async function sendBookingNotification(
  userId: string,
  bookingId: string,
  type: string
): Promise<void> {
  try {
    const db = admin.firestore();

    await db.collection('notifications').add({
      userId,
      type,
      bookingId,
      title: 'Nova Aula Solicitada',
      body: 'Um aluno quer agendar uma aula com você. Confirme em até 2 horas!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    // TODO: Send FCM push notification
    console.log(`Notification sent to ${userId} for booking ${bookingId}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Helper: Format date as YYYY-MM-DD-HH
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Background function: Process booking acceptance timeouts
 * Triggered every minute to check for expired bookings
 */
export const processBookingTimeouts = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    try {
      // Get expired timeouts
      const expiredTimeouts = await db
        .collection('bookingTimeouts')
        .where('scheduledFor', '<=', now)
        .where('processed', '==', false)
        .limit(50)
        .get();

      console.log(`Processing ${expiredTimeouts.size} expired booking timeouts`);

      for (const timeoutDoc of expiredTimeouts.docs) {
        const timeout = timeoutDoc.data();
        const bookingId = timeout.bookingId;

        // Get booking
        const bookingDoc = await db.collection('bookings').doc(bookingId).get();

        if (!bookingDoc.exists) {
          await timeoutDoc.ref.update({ processed: true });
          continue;
        }

        const booking = bookingDoc.data();

        // Only auto-cancel if still pending
        if (booking.status === 'pendente') {
          // Auto-cancel booking
          await db.collection('bookings').doc(bookingId).update({
            status: 'cancelada',
            cancellationReason: 'Instrutor não aceitou em 2 horas',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Release calendar slot
          const calendarSlotRef = db
            .collection('instructors')
            .doc(booking.instructorId)
            .collection('calendar')
            .doc(formatDateKey(booking.date.toDate()));

          await calendarSlotRef.delete();

          // Process refund (100% deposit)
          await processRefund(bookingId, booking.depositAmount, 'timeout');

          // Notify student
          await db.collection('notifications').add({
            userId: booking.studentId,
            type: 'booking_timeout',
            bookingId,
            title: 'Aula Cancelada',
            body: 'O instrutor não confirmou a tempo. Seu depósito será reembolsado.',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          });

          console.log(`Booking ${bookingId} auto-cancelled due to timeout`);
        }

        // Mark timeout as processed
        await timeoutDoc.ref.update({ processed: true });
      }

    } catch (error) {
      console.error('Error processing booking timeouts:', error);
    }
  });

/**
 * Helper: Process refund
 */
async function processRefund(
  bookingId: string,
  amount: number,
  reason: string
): Promise<void> {
  try {
    const db = admin.firestore();

    // TODO: Implement Mercado Pago refund API
    console.log(`Processing refund for booking ${bookingId}: R$ ${amount}`);

    await db.collection('refunds').add({
      bookingId,
      amount,
      reason,
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Refund processing failed:', error);
  }
}

