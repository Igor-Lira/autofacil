import apiClient from './api-client';
import type {
  ChatMessage,
  ChatMessageSend,
  PaginatedMessagesResponse
} from '../../lib/models/chat';

class ChatService {
  /**
   * Get chat messages for a booking
   */
  async getMessages(bookingId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedMessagesResponse> {
    const response = await apiClient.get<PaginatedMessagesResponse>(`/chat/${bookingId}`, { params });
    return response.data;
  }

  /**
   * Send a chat message
   */
  async sendMessage(bookingId: string, message: ChatMessageSend): Promise<ChatMessage> {
    const response = await apiClient.post<ChatMessage>(`/chat/${bookingId}`, message);
    return response.data;
  }

  /**
   * Report inappropriate message or behavior
   */
  async reportMessage(
    bookingId: string,
    messageId: string,
    reason: 'spam' | 'harassment' | 'inappropriate' | 'fraud',
    details?: string
  ): Promise<void> {
    await apiClient.post(`/chat/${bookingId}/report`, {
      messageId,
      reason,
      details,
    });
  }
}

export default new ChatService();

