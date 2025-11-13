import apiClient from './api-client';
import type {
  ConsentPreferences,
  DataRetentionInfo
} from '../../lib/models/lgpd';

class LGPDService {
  /**
   * Request data export (LGPD data portability)
   */
  async requestDataExport(): Promise<{
    exportId: string;
    status: 'processing' | 'ready';
    downloadUrl?: string;
    expiresAt: string;
  }> {
    const response = await apiClient.get('/lgpd/data-export');
    return response.data;
  }

  /**
   * Check export status or download
   */
  async getDataExport(exportId: string): Promise<{
    downloadUrl: string;
    expiresAt: string;
  }> {
    const response = await apiClient.get(`/lgpd/data-export/${exportId}`);
    return response.data;
  }

  /**
   * Request account deletion (LGPD right to be forgotten)
   */
  async requestAccountDeletion(
    confirmPassword: string,
    reason: 'no_longer_needed' | 'privacy_concerns' | 'other',
    feedback?: string
  ): Promise<{
    scheduledDate: string;
    cancellationDeadline: string;
  }> {
    const response = await apiClient.delete('/lgpd/delete-account', {
      data: {
        confirmPassword,
        reason,
        feedback,
      },
    });
    return response.data;
  }

  /**
   * Cancel pending account deletion
   */
  async cancelAccountDeletion(): Promise<void> {
    await apiClient.post('/lgpd/delete-account/cancel');
  }

  /**
   * Get current consent preferences
   */
  async getConsentPreferences(): Promise<ConsentPreferences> {
    const response = await apiClient.get<ConsentPreferences>('/lgpd/consent');
    return response.data;
  }

  /**
   * Update consent preferences
   */
  async updateConsentPreferences(preferences: ConsentPreferences): Promise<void> {
    await apiClient.patch('/lgpd/consent', preferences);
  }

  /**
   * Get data retention information
   */
  async getDataRetention(): Promise<DataRetentionInfo> {
    const response = await apiClient.get<DataRetentionInfo>('/lgpd/data-retention');
    return response.data;
  }
}

export default new LGPDService();

