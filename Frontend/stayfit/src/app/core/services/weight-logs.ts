import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface WeightLogDto {
  id: number;
  weightKg: number;
  recordedAt: string;
}

export interface FilterWeightLogs {
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveWeightLogDto {
  weightKg: number;
  recordedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WeightLogs extends BaseApi {
  getAll(filter: FilterWeightLogs = {}) {
    return this.get<WeightLogDto[]>('/weight-logs', filter);
  }

  create(dto: SaveWeightLogDto) {
    return this.post<WeightLogDto>('/weight-logs', dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/weight-logs/${id}`);
  }
}
