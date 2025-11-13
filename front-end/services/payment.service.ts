import apiClient from './api-client';
import type {
  Payment,
  PaymentRequest,
  PaymentResponse,
  Wallet,
  WithdrawalRequest
} from '../../lib/models/payment';

class PaymentService {
  /**
   * Initiate payment for a booking
   */
  async createPayment(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/payments', data);
    return response.data;
  }

  /**
   * Get payment details by ID
   */
  async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  }

  /**
   * Request refund for cancelled booking
   */
  async requestRefund(bookingId: string, reason: string): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    const response = await apiClient.post('/payments/refund', { bookingId, reason });
    return response.data;
  }

  /**
   * Get instructor wallet info
   */
  async getWallet(): Promise<Wallet> {
    const response = await apiClient.get<Wallet>('/wallet');
    return response.data;
  }

  /**
   * Request withdrawal from wallet
   */
  async requestWithdrawal(data: WithdrawalRequest): Promise<{
    withdrawalId: string;
    expectedDate: string;
  }> {
    const response = await apiClient.post('/wallet', data);
    return response.data;
  }
}

export default new PaymentService();

