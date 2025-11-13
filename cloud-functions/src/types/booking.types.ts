/**
 * Type definitions for Scheduling & Bookings
 */

export interface BookingCreateRequest {
  instructorId: string;
  date: string; // ISO 8601
  duration: number; // hours (1-4)
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  category: string; // A, B, C, D, E, ACC
  focus: string; // manobras, rodovia, estacionamento, baliza, geral
}

export interface Booking {
  id: string;
  studentId: string;
  instructorId: string;
  date: Date;
  duration: number;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  category: string;
  focus: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  detranProtocol?: string;
  cancellationReason?: string;
  rescheduleCount: number;
  createdAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  price: number;
  depositAmount: number;
  remainingAmount: number;
}

export enum BookingStatus {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada'
}

export enum PaymentStatus {
  PENDENTE = 'pendente',
  DEPOSITO_PAGO = 'deposito_pago',
  PAGO = 'pago',
  REEMBOLSADO = 'reembolsado'
}

export interface BookingConfirmRequest {
  bookingId: string;
  instructorId: string;
}

export interface BookingCancelRequest {
  bookingId: string;
  userId: string;
  userType: 'student' | 'instructor';
  reason?: string;
}

export interface BookingRescheduleRequest {
  bookingId: string;
  newDate: string; // ISO 8601
  newDuration?: number;
}

export interface LessonCompletionRequest {
  bookingId: string;
  instructorId: string;
  actualDuration: number;
  notes?: string;
  progressRating?: number; // 1-5
}

export interface CancellationPolicy {
  refundPercentage: number;
  penaltyAmount: number;
  reason: string;
}

