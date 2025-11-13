/**
 * Cloud Function: markLessonCompleted
 *
 * Instructor marks lesson as completed.
 * Triggers:
 * - Detran validation (async)
 * - Payment release (85% after 24h hold)
 * - Rating request to student
 *
 * Dependencies:
 * - Firestore
 * - validateLessonWithDetran (async call)
 * - Pub/Sub (24h payment release queue)
 * - FCM (rating prompt)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import { LessonCompletionRequest, BookingStatus } from '../types/booking.types';

export const markLessonCompleted = functions.https.onCall(
  async (data: LessonCompletionRequest, context) => {
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
      if (!data.bookingId || !data.actualDuration) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Booking ID and actual duration are required',
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
          'Only the assigned instructor can mark this lesson as completed',
          403
        );
      }

      // 4. Check if already completed
      if (booking.status === 'concluida') {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Lesson is already marked as completed',
          400
        );
      }

      // 5. Check if lesson date has passed
      const lessonDate = booking.date.toDate();
      const now = new Date();

      if (lessonDate > now) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Cannot mark future lesson as completed',
          400
        );
      }

      // 6. Update booking status
      await db.collection('bookings').doc(data.bookingId).update({
        status: BookingStatus.CONCLUIDA,
        actualDuration: data.actualDuration,
        instructorNotes: data.notes || null,
        progressRating: data.progressRating || null,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 7. Trigger Detran validation (async)
      await triggerDetranValidation(data.bookingId, booking);

      // 8. Charge remaining payment (80%)
      await chargeRemainingPayment(data.bookingId, booking);

      // 9. Schedule payment release to instructor (24h hold)
      await schedulePaymentRelease(
        data.bookingId,
        instructorId,
        booking.price,
        24 * 60 * 60 * 1000 // 24 hours
      );

      // 10. Send rating request to student
      await sendRatingRequest(booking.studentId, data.bookingId, instructorId);

      // 11. Update student progress
      await updateStudentProgress(
        booking.studentId,
        booking.category,
        data.actualDuration,
        'pratica' // Assuming practical lesson
      );

      // 12. Log completion
      console.log(`Lesson marked as completed: ${data.bookingId}`, {
        instructorId,
        studentId: booking.studentId,
        actualDuration: data.actualDuration
      });

      return {
        bookingId: data.bookingId,
        status: BookingStatus.CONCLUIDA,
        detranValidationStatus: 'processing',
        paymentReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        message: 'Lesson marked as completed successfully'
      };

    } catch (error) {
      console.error('Error marking lesson completed:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to mark lesson as completed',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Trigger Detran validation (async)
 */
async function triggerDetranValidation(bookingId: string, booking: any): Promise<void> {
  try {
    const db = admin.firestore();

    // Get student and instructor data
    const studentDoc = await db.collection('students').doc(booking.studentId).get();
    const instructorDoc = await db.collection('instructors').doc(booking.instructorId).get();

    const student = studentDoc.data();
    const instructor = instructorDoc.data();

    // Queue Detran validation
    await db.collection('detranValidationQueue').add({
      bookingId,
      cpf_aluno: student?.cpf,
      cpf_instrutor: instructor?.cpf,
      data_aula: booking.date.toDate().toISOString(),
      duracao_horas: booking.actualDuration || booking.duration,
      categoria: booking.category,
      tipo: 'pratica',
      veiculo_placa: instructor?.vehicle?.plate,
      status: 'pending',
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Detran validation queued for booking ${bookingId}`);

  } catch (error) {
    console.error('Failed to trigger Detran validation:', error);
    // Don't throw - lesson completion should succeed
  }
}

/**
 * Helper: Charge remaining payment (80%)
 */
async function chargeRemainingPayment(bookingId: string, booking: any): Promise<void> {
  try {
    // TODO: Implement Mercado Pago charge for remaining 80%
    console.log(`Charging remaining payment for booking ${bookingId}: R$ ${booking.remainingAmount}`);

    const db = admin.firestore();
    await db.collection('payments').add({
      bookingId,
      studentId: booking.studentId,
      amount: booking.remainingAmount,
      type: 'remaining_payment',
      method: 'automatic',
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Failed to charge remaining payment:', error);
    // Don't throw - will retry via webhook
  }
}

/**
 * Helper: Schedule payment release to instructor
 */
async function schedulePaymentRelease(
  bookingId: string,
  instructorId: string,
  totalAmount: number,
  delayMs: number
): Promise<void> {
  try {
    const db = admin.firestore();

    // Calculate instructor amount (85%, platform keeps 15%)
    const platformFee = Math.round(totalAmount * 0.15);
    const instructorAmount = totalAmount - platformFee;

    // Schedule payment release
    await db.collection('paymentReleaseQueue').add({
      bookingId,
      instructorId,
      totalAmount,
      platformFee,
      instructorAmount,
      scheduledFor: new Date(Date.now() + delayMs),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: false
    });

    console.log(`Payment release scheduled for booking ${bookingId} in 24h`);

  } catch (error) {
    console.error('Failed to schedule payment release:', error);
  }
}

/**
 * Helper: Send rating request to student
 */
async function sendRatingRequest(
  studentId: string,
  bookingId: string,
  instructorId: string
): Promise<void> {
  try {
    const db = admin.firestore();

    await db.collection('notifications').add({
      userId: studentId,
      type: 'rating_request',
      bookingId,
      instructorId,
      title: 'Avalie sua Aula',
      body: 'Como foi sua experiência? Sua avaliação ajuda outros alunos!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      actionUrl: `/bookings/${bookingId}/rate`
    });

    // TODO: Send FCM push notification
    console.log(`Rating request sent to student ${studentId}`);

  } catch (error) {
    console.error('Failed to send rating request:', error);
  }
}

/**
 * Helper: Update student progress
 */
async function updateStudentProgress(
  studentId: string,
  category: string,
  hours: number,
  type: 'teorica' | 'pratica'
): Promise<void> {
  try {
    const db = admin.firestore();
    const progressRef = db
      .collection('students')
      .doc(studentId)
      .collection('progress')
      .doc(category);

    const fieldName = type === 'teorica' ? 'theoreticalHours' : 'practicalHours';

    await progressRef.set(
      {
        [fieldName]: admin.firestore.FieldValue.increment(hours),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    // Check exam eligibility (20h theoretical + 20h practical)
    const progress = await progressRef.get();
    const data = progress.data();

    if (data) {
      const eligible =
        (data.theoreticalHours || 0) >= 20 &&
        (data.practicalHours || 0) >= 20;

      if (eligible && !data.examEligible) {
        await progressRef.update({ examEligible: true });

        // Notify student
        await db.collection('notifications').add({
          userId: studentId,
          type: 'exam_eligible',
          title: 'Parabéns!',
          body: 'Você completou as horas necessárias e está elegível para o exame!',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      }
    }

    console.log(`Student progress updated: ${studentId} - ${category} +${hours}h ${type}`);

  } catch (error) {
    console.error('Failed to update student progress:', error);
  }
}

/**
 * Background function: Process payment release queue
 * Runs every 5 minutes to release payments after 24h hold
 */
export const processPaymentReleases = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    try {
      // Get payments ready for release
      const releasesSnapshot = await db
        .collection('paymentReleaseQueue')
        .where('scheduledFor', '<=', now)
        .where('processed', '==', false)
        .limit(50)
        .get();

      console.log(`Processing ${releasesSnapshot.size} payment releases`);

      for (const releaseDoc of releasesSnapshot.docs) {
        const release = releaseDoc.data();

        // Update instructor wallet
        const instructorRef = db.collection('instructors').doc(release.instructorId);

        await instructorRef.update({
          'wallet.available': admin.firestore.FieldValue.increment(release.instructorAmount),
          'wallet.total': admin.firestore.FieldValue.increment(release.instructorAmount)
        });

        // Create wallet transaction
        await db.collection('walletTransactions').add({
          userId: release.instructorId,
          type: 'credit',
          amount: release.instructorAmount,
          description: `Aula concluída - #${release.bookingId}`,
          bookingId: release.bookingId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Notify instructor
        await db.collection('notifications').add({
          userId: release.instructorId,
          type: 'payment_released',
          bookingId: release.bookingId,
          title: 'Pagamento Liberado',
          body: `R$ ${release.instructorAmount.toFixed(2)} foi adicionado à sua carteira`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });

        // Mark as processed
        await releaseDoc.ref.update({
          processed: true,
          processedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Payment released: ${release.instructorId} - R$ ${release.instructorAmount}`);
      }

    } catch (error) {
      console.error('Error processing payment releases:', error);
    }
  });

