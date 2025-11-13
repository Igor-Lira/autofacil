/**
 * Enums for AutoFacil API
 * Generated from api.yaml
 */

export enum UserType {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export enum UserStatus {
  ATIVO = 'ativo',
  SUSPENSO = 'suspenso',
}

export enum InstructorStatus {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
  SUSPENSO = 'suspenso',
}

export enum LicenseCategory {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  ACC = 'ACC',
}

export enum VehicleType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum LessonFocus {
  MANOBRAS = 'manobras',
  RODOVIA = 'rodovia',
  ESTACIONAMENTO = 'estacionamento',
  BALIZA = 'baliza',
  GERAL = 'geral',
}

export enum BookingStatus {
  PENDENTE = 'pendente',
  CONFIRMADA = 'confirmada',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

export enum PaymentStatus {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  REEMBOLSADO = 'reembolsado',
}

export enum PaymentMethod {
  PIX = 'pix',
  CARD = 'card',
  BOLETO = 'boleto',
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDENTE = 'pendente',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
}

export enum WithdrawalMethod {
  PIX = 'pix',
  TED = 'ted',
}

export enum BankAccountType {
  CORRENTE = 'corrente',
  POUPANCA = 'poupanca',
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE = 'inappropriate',
  FRAUD = 'fraud',
}

export enum ReportType {
  CHAT = 'chat',
  PROFILE = 'profile',
  BEHAVIOR = 'behavior',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

export enum DetranLessonType {
  TEORICA = 'teorica',
  PRATICA = 'pratica',
}

export enum DetranValidationStatus {
  VALIDADA = 'validada',
  REJEITADA = 'rejeitada',
  PENDENTE = 'pendente',
}

export enum RefundStatus {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
}

export enum ExportStatus {
  PROCESSING = 'processing',
  READY = 'ready',
}

export enum DeletionReason {
  NO_LONGER_NEEDED = 'no_longer_needed',
  PRIVACY_CONCERNS = 'privacy_concerns',
  OTHER = 'other',
}

