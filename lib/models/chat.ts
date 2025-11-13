/**
 * Chat and Messaging Models
 */

import { MessageType, MessageStatus, ReportReason } from './enums';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: string;
  status: MessageStatus;
  mediaUrl?: string;
}

export interface ChatMessageSend {
  content: string;
  type: MessageType;
}

export interface ChatReport {
  messageId: string;
  reason: ReportReason;
  details?: string;
}

