import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { Gender } from '../models/enums';

export interface ClientProfileDto {
  id: number;
  name: string;
  heightCm: number;
  dateOfBirth: string;
  gender: Gender;
}

export interface SaveClientProfileDto {
  heightCm: number;
  dateOfBirth: string;
  gender: Gender;
}

@Injectable({ providedIn: 'root' })
export class ClientProfiles extends BaseApi {
  getById(id: number) {
    return this.get<ClientProfileDto>(`/client-profiles/${id}`);
  }

  getMe() {
    return this.get<ClientProfileDto>('/client-profiles/me');
  }

  updateMe(dto: SaveClientProfileDto) {
    return this.put<ClientProfileDto>('/client-profiles/me', dto);
  }
}
