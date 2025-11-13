/**
 * LGPD Compliance Models
 */

import { ExportStatus, DeletionReason } from './enums';

export interface ConsentPreferences {
  locationTracking: boolean;
  dataSharing: boolean;
  marketing: boolean;
  thirdPartySharing: boolean;
  updatedAt?: string;
}

export interface DataExportResponse {
  exportId: string;
  status: ExportStatus;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface AccountDeletionRequest {
  confirmPassword: string;
  reason: DeletionReason;
  feedback?: string;
}

export interface AccountDeletionResponse {
  scheduledDate: string;
  cancellationDeadline: string;
}

export interface DataRetentionInfo {
  accountCreated: string;
  lastActivity: string;
  dataRetentionUntil: string;
  categories: DataRetentionCategory[];
}

export interface DataRetentionCategory {
  type: string;
  retentionPeriod: string;
  purpose: string;
}

