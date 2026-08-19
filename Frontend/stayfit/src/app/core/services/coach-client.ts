import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { CoachClientStatus } from '../models/enums';

export interface CoachClientDto {
  id: number;
  clientProfileId: number;
  userId: number;
  name: string;
  status: CoachClientStatus;
  requestedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CoachClient extends BaseApi {
  requestCoach(coachId: number) {
    return this.post<void>(`/coach-client/request/${coachId}`, {});
  }

  getMyClients() {
    return this.get<CoachClientDto[]>('/coach-client/my-clients');
  }

  getMyCoaches() {
    return this.get<CoachClientDto[]>('/coach-client/my-coaches');
  }

  accept(id: number) {
    return this.put<void>(`/coach-client/${id}/accept`, {});
  }

  reject(id: number) {
    return this.put<void>(`/coach-client/${id}/reject`, {});
  }

  endRelation(id: number) {
    return this.delete<void>(`/coach-client/${id}`);
  }
}
