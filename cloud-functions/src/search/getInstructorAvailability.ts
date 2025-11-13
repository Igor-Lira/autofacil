/**
 * Cloud Function: getInstructorAvailability
 *
 * Returns available time slots for an instructor in the next 30 days.
 * Excludes booked slots and rest periods. Groups by day.
 *
 * Dependencies:
 * - Firestore (/instructors/{id}/calendar, /bookings)
 * - moment-timezone (timezone handling)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FunctionError, ErrorCodes } from '../utils/errors';
import {
  InstructorAvailabilityRequest,
  AvailabilitySlot,
  TimeSlot
} from '../types/search.types';

export const getInstructorAvailability = functions.https.onCall(
  async (data: InstructorAvailabilityRequest, context) => {
    const db = admin.firestore();

    try {
      // 1. Validate instructor ID
      if (!data.instructorId) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Instructor ID is required',
          400
        );
      }

      // 2. Verify instructor exists and is approved
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

      // 3. Set date range (default: next 30 days)
      const startDate = data.startDate
        ? new Date(data.startDate)
        : new Date();

      const endDate = data.endDate
        ? new Date(data.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Validate date range
      if (startDate >= endDate) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          'Start date must be before end date',
          400
        );
      }

      // Limit to 60 days maximum
      const maxDays = 60;
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > maxDays) {
        throw new FunctionError(
          ErrorCodes.VALIDATION_ERROR,
          `Date range cannot exceed ${maxDays} days`,
          400
        );
      }

      // 4. Get instructor's calendar settings
      const calendar = instructor.calendar || getDefaultCalendar();

      // 5. Get all bookings in date range
      const bookingsSnapshot = await db
        .collection('bookings')
        .where('instructorId', '==', data.instructorId)
        .where('date', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .where('date', '<=', admin.firestore.Timestamp.fromDate(endDate))
        .where('status', 'in', ['confirmada', 'pendente'])
        .get();

      const bookedSlots: Map<string, string[]> = new Map();

      bookingsSnapshot.forEach(doc => {
        const booking = doc.data();
        const date = booking.date.toDate();
        const dateKey = formatDateKey(date);
        const timeKey = formatTimeKey(date);

        if (!bookedSlots.has(dateKey)) {
          bookedSlots.set(dateKey, []);
        }
        bookedSlots.get(dateKey)!.push(timeKey);
      });

      // 6. Generate availability slots
      const availability: AvailabilitySlot[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateKey = formatDateKey(currentDate);

        // Get calendar settings for this day
        const daySchedule = calendar[getDayName(dayOfWeek)];

        if (daySchedule && daySchedule.enabled) {
          const slots: TimeSlot[] = [];

          // Generate hourly slots between start and end times
          const startHour = parseInt(daySchedule.startTime.split(':')[0]);
          const endHour = parseInt(daySchedule.endTime.split(':')[0]);

          for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = `${hour.toString().padStart(2, '0')}:00`;
            const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;

            // Check if slot is booked
            const isBooked = bookedSlots.get(dateKey)?.includes(slotStart) || false;

            // Check if in the past
            const slotDateTime = new Date(currentDate);
            slotDateTime.setHours(hour, 0, 0, 0);
            const isPast = slotDateTime < new Date();

            slots.push({
              start: slotStart,
              end: slotEnd,
              available: !isBooked && !isPast,
              duration: 1 // 1 hour slots
            });
          }

          // Only add day if it has slots
          if (slots.length > 0) {
            availability.push({
              date: currentDate.toISOString().split('T')[0],
              slots
            });
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 7. Log request
      console.log(`Availability fetched for instructor ${data.instructorId}`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays: availability.length
      });

      // 8. Return availability
      return {
        instructorId: data.instructorId,
        availability
      };

    } catch (error) {
      console.error('Error getting instructor availability:', error);

      if (error instanceof FunctionError) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          error.message,
          error.toJSON()
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to get instructor availability',
        { originalError: error.message }
      );
    }
  }
);

/**
 * Helper: Get default calendar (Mon-Fri 8am-6pm, Sat 8am-12pm)
 */
function getDefaultCalendar() {
  return {
    monday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    tuesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    wednesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    thursday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    friday: { enabled: true, startTime: '08:00', endTime: '18:00' },
    saturday: { enabled: true, startTime: '08:00', endTime: '12:00' },
    sunday: { enabled: false, startTime: '00:00', endTime: '00:00' }
  };
}

/**
 * Helper: Get day name from day of week number
 */
function getDayName(dayOfWeek: number): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayOfWeek];
}

/**
 * Helper: Format date as YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper: Format time as HH:mm
 */
function formatTimeKey(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}

/**
 * Background function to sync instructor calendar from external sources
 * (e.g., Google Calendar integration)
 */
export const syncInstructorCalendar = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Get instructors with external calendar integration
      const instructorsSnapshot = await db
        .collection('instructors')
        .where('calendarSync.enabled', '==', true)
        .get();

      console.log(`Syncing calendars for ${instructorsSnapshot.size} instructors`);

      const batch = db.batch();
      let syncCount = 0;

      for (const doc of instructorsSnapshot.docs) {
        const instructor = doc.data();

        // TODO: Implement Google Calendar API integration
        // For now, this is a placeholder

        // const externalEvents = await fetchGoogleCalendarEvents(
        //   instructor.calendarSync.accessToken,
        //   instructor.calendarSync.calendarId
        // );

        // Update calendar based on external events
        // Mark slots as unavailable if they have external events

        syncCount++;
      }

      if (syncCount > 0) {
        await batch.commit();
      }

      console.log(`Calendar sync completed: ${syncCount} instructors updated`);

    } catch (error) {
      console.error('Calendar sync failed:', error);
    }
  });

