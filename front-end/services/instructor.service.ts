import apiClient from './api-client';
import type {
  InstructorProfile,
  InstructorRating,
  InstructorSearchParams,
  PaginatedInstructorsResponse,
  AvailabilitySlot
} from '../../lib/models/user';

class InstructorService {
  /**
   * Get current instructor profile
   */
  async getProfile(): Promise<InstructorProfile> {
    const response = await apiClient.get<InstructorProfile>('/instructors/me');
    return response.data;
  }

  /**
   * Update instructor profile
   */
  async updateProfile(data: Partial<InstructorProfile>): Promise<InstructorProfile> {
    const response = await apiClient.patch<InstructorProfile>('/instructors/me', data);
    return response.data;
  }

  /**
   * Get instructor rating and badges
   */
  async getRating(): Promise<InstructorRating> {
    const response = await apiClient.get<InstructorRating>('/instructors/me/rating');
    return response.data;
  }

  /**
   * Search instructors with filters and pagination
   */
  async search(params: InstructorSearchParams): Promise<PaginatedInstructorsResponse> {
    const response = await apiClient.get<PaginatedInstructorsResponse>('/instructors', { params });
    return response.data;
  }

  /**
   * Get instructor details by ID
   */
  async getById(id: string): Promise<InstructorProfile> {
    const response = await apiClient.get<InstructorProfile>(`/instructors/${id}`);
    return response.data;
  }

  /**
   * Get instructor availability
   */
  async getAvailability(
    id: string,
    startDate: string,
    endDate: string
  ): Promise<{ slots: AvailabilitySlot[] }> {
    const response = await apiClient.get(`/instructors/${id}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export default new InstructorService();

