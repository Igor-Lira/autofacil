/**
 * Booking and Scheduling Models
 */

import { BookingStatus, PaymentStatus, LicenseCategory, LessonFocus } from './enums';

export interface ScheduleRequest {
  instructorId: string;
  date: string;
  duration: number; // 1-4 hours
  location: string;
  category: LicenseCategory;
  focus: LessonFocus;
}

export interface Booking {
  id: string;
  studentId: string;
  instructorId: string;
  date: string;
  duration: number;
  location: string;
  category: LicenseCategory;
  focus: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  detranProtocol?: string;
  cancellationReason?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface BookingUpdate {
  status?: BookingStatus;
  rescheduleDate?: string;
  cancellationReason?: string;
}

export interface AvailabilitySlot {
  date: string;
  duration: number;
}

