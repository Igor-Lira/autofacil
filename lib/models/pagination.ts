/**
 * Pagination Models
 */

import { InstructorSummary } from './user';
import { Booking } from './booking';
import { ChatMessage } from './chat';
import { Report } from './admin';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedInstructorsResponse extends PaginatedResponse<InstructorSummary> {}

export interface PaginatedBookingsResponse extends PaginatedResponse<Booking> {}

export interface PaginatedMessagesResponse extends PaginatedResponse<ChatMessage> {}

export interface PaginatedReportsResponse extends PaginatedResponse<Report> {}

