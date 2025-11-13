import apiClient from './api-client';
import type {
  DetranValidationRequest,
  DetranValidationResponse
} from '../../lib/models/detran';

class DetranService {
  /**
   * Validate lesson with Detran
   */
  async validateLesson(data: DetranValidationRequest): Promise<DetranValidationResponse> {
    const response = await apiClient.post<DetranValidationResponse>('/detran/validate-lesson', data);
    return response.data;
  }
}

export default new DetranService();

