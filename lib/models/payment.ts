/**
 * Payment and Wallet Models
 */

import { PaymentMethod, PaymentStatus, TransactionType, TransactionStatus, WithdrawalMethod, BankAccountType } from './enums';

export interface PaymentRequest {
  bookingId: string;
  method: PaymentMethod;
  amount: number;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  qrCode?: string;
  qrCodeUrl?: string;
  boletoUrl?: string;
  expiresAt?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  instructorAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}

export interface Wallet {
  available: number;
  blocked: number;
  total: number;
  history: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
}

export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  pixKey?: string;
  bankAccount?: BankAccount;
}

export interface BankAccount {
  bank: string;
  agency: string;
  account: string;
  accountType: BankAccountType;
}

export interface RefundRequest {
  bookingId: string;
  reason: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: string;
}

