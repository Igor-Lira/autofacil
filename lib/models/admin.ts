/**
 * Admin and Moderation Models
 */

import { ReportType, ReportStatus } from './enums';
import { InstructorSummary } from './user';

export interface Report {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  type: ReportType;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AdminApprovalNotes {
  notes?: string;
}

export interface AdminRejection {
  reason: string;
}

export interface UserSuspension {
  reason: string;
  duration: number; // days
}

