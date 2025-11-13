import apiClient from './api-client';
import type { StudentProfile, StudentProgress } from '../../lib/models/user';

class StudentService {
  /**
   * Get current student profile
   */
  async getProfile(): Promise<StudentProfile> {
    const response = await apiClient.get<StudentProfile>('/students/me');
    return response.data;
  }

  /**
   * Update student profile
   */
  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const response = await apiClient.patch<StudentProfile>('/students/me', data);
    return response.data;
  }

  /**
   * Get student progress dashboard
   */
  async getProgress(): Promise<StudentProgress> {
    const response = await apiClient.get<StudentProgress>('/students/me/progress');
    return response.data;
  }
}

export default new StudentService();

