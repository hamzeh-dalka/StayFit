import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { Specialty } from '../models/enums';

export interface CoachProfileDto {
  id: number;
  name: string;
  specialty: Specialty;
  bio: string;
  experienceYears: number;
}

export interface FilterCoachProfiles {
  specialty?: Specialty;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveCoachProfileDto {
  specialty: Specialty;
  bio: string;
  experienceYears: number;
}

@Injectable({ providedIn: 'root' })
export class CoachProfiles extends BaseApi {
  getAll(filter: FilterCoachProfiles = {}) {
    return this.get<CoachProfileDto[]>('/coach-profiles', filter);
  }

  getById(id: number) {
    return this.get<CoachProfileDto>(`/coach-profiles/${id}`);
  }

  getMe() {
    return this.get<CoachProfileDto>('/coach-profiles/me');
  }

  updateMe(dto: SaveCoachProfileDto) {
    return this.put<CoachProfileDto>('/coach-profiles/me', dto);
  }
}
