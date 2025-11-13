import apiClient from './api-client';
import type {
  TrackingData,
  LocationUpdate
} from '../../lib/models/tracking';

class TrackingService {
  /**
   * Start GPS tracking for a lesson
   */
  async startTracking(bookingId: string): Promise<{
    trackingId: string;
    startedAt: string;
  }> {
    const response = await apiClient.post('/tracking/start', { bookingId });
    return response.data;
  }

  /**
   * Update current location during lesson
   */
  async updateLocation(trackingId: string, location: LocationUpdate): Promise<void> {
    await apiClient.post(`/tracking/${trackingId}/location`, location);
  }

  /**
   * Stop GPS tracking
   */
  async stopTracking(trackingId: string): Promise<{
    duration: number;
    distance: number;
  }> {
    const response = await apiClient.post(`/tracking/${trackingId}/stop`);
    return response.data;
  }

  /**
   * Get tracking data for a lesson
   */
  async getTrackingData(trackingId: string): Promise<TrackingData> {
    const response = await apiClient.get<TrackingData>(`/tracking/${trackingId}`);
    return response.data;
  }

  /**
   * Send emergency SOS alert
   */
  async sendSOS(
    bookingId: string,
    latitude: number,
    longitude: number,
    message?: string
  ): Promise<{
    alertId: string;
    notifiedContacts: string[];
  }> {
    const response = await apiClient.post('/tracking/sos', {
      bookingId,
      latitude,
      longitude,
      message,
    });
    return response.data;
  }
}

export default new TrackingService();

