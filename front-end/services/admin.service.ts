import apiClient from './api-client';
import type {
  InstructorProfile,
  PaginatedInstructorsResponse
} from '../../lib/models/user';
import type { Report } from '../../lib/models/admin';

class AdminService {
  /**
   * Get pending instructor approvals
   */
  async getPendingInstructors(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedInstructorsResponse> {
    const response = await apiClient.get<PaginatedInstructorsResponse>('/admin/instructors/pending', { params });
    return response.data;
  }

  /**
   * Approve instructor registration
   */
  async approveInstructor(id: string, notes?: string): Promise<void> {
    await apiClient.post(`/admin/instructors/${id}/approve`, { notes });
  }

  /**
   * Reject instructor registration
   */
  async rejectInstructor(id: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/instructors/${id}/reject`, { reason });
  }

  /**
   * Get user reports and moderation queue
   */
  async getReports(params?: {
    status?: 'pending' | 'reviewed' | 'resolved';
    type?: 'chat' | 'profile' | 'behavior';
    page?: number;
  }): Promise<{
    data: Report[];
    page: number;
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  }

  /**
   * Suspend user account
   */
  async suspendUser(id: string, reason: string, duration: number): Promise<void> {
    await apiClient.post(`/admin/users/${id}/suspend`, { reason, duration });
  }
}

export default new AdminService();

