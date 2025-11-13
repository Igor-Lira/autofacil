import apiClient from './api-client';
import type {
  Booking,
  BookingCreate,
  BookingUpdate,
  BookingStatus,
  PaginatedBookingsResponse
} from '../../lib/models/booking';

class SchedulingService {
  /**
   * Create a new lesson booking
   */
  async createBooking(data: BookingCreate): Promise<Booking> {
    const response = await apiClient.post<Booking>('/scheduling', data);
    return response.data;
  }

  /**
   * List my bookings with filters and pagination
   */
  async listBookings(params?: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedBookingsResponse> {
    const response = await apiClient.get<PaginatedBookingsResponse>('/scheduling', { params });
    return response.data;
  }

  /**
   * Get booking details by ID
   */
  async getBooking(id: string): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/scheduling/${id}`);
    return response.data;
  }

  /**
   * Update booking status
   */
  async updateBooking(id: string, data: BookingUpdate): Promise<Booking> {
    const response = await apiClient.patch<Booking>(`/scheduling/${id}`, data);
    return response.data;
  }

  /**
   * Confirm a booking
   */
  async confirmBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { status: 'confirmada' });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'cancelada',
      cancelamento: {
        motivo: reason,
        dataHora: new Date().toISOString()
      }
    });
  }

  /**
   * Complete a booking
   */
  async completeBooking(id: string, notaProgresso?: number): Promise<Booking> {
    return this.updateBooking(id, {
      status: 'concluida',
      notaProgresso
    });
  }
}

export default new SchedulingService();

