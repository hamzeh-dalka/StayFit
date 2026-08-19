import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { NotificationType } from '../models/enums';

export interface NotificationDto {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class Notifications extends BaseApi {
  getAll() {
    return this.get<NotificationDto[]>('/notifications');
  }

  markAsRead(id: number) {
    return this.put<void>(`/notifications/${id}/read`, {});
  }

  markAllAsRead() {
    return this.put<void>('/notifications/read-all', {});
  }
}
