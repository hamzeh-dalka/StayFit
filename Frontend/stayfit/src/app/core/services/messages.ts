import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface MessageDto {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface SendMessageDto {
  receiverId: number;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class Messages extends BaseApi {
  getConversation(userId: number) {
    return this.get<MessageDto[]>(`/messages/conversation/${userId}`);
  }

  send(dto: SendMessageDto) {
    return this.post<MessageDto>('/messages', dto);
  }

  markAsRead(id: number) {
    return this.put<void>(`/messages/${id}/read`, {});
  }
}
