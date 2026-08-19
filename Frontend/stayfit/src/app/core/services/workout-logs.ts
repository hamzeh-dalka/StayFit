import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface WorkoutLogDto {
  id: number;
  loggedAt: string;
  durationMinutes: number;
}

export interface WorkoutLogItemDto {
  id: number;
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: number;
}

export interface WorkoutLogDetailDto {
  id: number;
  loggedAt: string;
  durationMinutes: number;
  items: WorkoutLogItemDto[];
}

export interface FilterWorkoutLogs {
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveWorkoutLogDto {
  loggedAt: string;
  durationMinutes: number;
}

export interface AddWorkoutLogItemDto {
  exerciseId: number;
  sets: number;
  reps: number;
}

@Injectable({ providedIn: 'root' })
export class WorkoutLogs extends BaseApi {
  getAll(filter: FilterWorkoutLogs = {}) {
    return this.get<WorkoutLogDto[]>('/workout-logs', filter);
  }

  getById(id: number) {
    return this.get<WorkoutLogDetailDto>(`/workout-logs/${id}`);
  }

  create(dto: SaveWorkoutLogDto) {
    return this.post<WorkoutLogDto>('/workout-logs', dto);
  }

  update(id: number, dto: SaveWorkoutLogDto) {
    return this.put<WorkoutLogDto>(`/workout-logs/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/workout-logs/${id}`);
  }

  addItem(workoutLogId: number, dto: AddWorkoutLogItemDto) {
    return this.post<void>(`/workout-logs/${workoutLogId}/items`, dto);
  }

  removeItem(workoutLogId: number, itemId: number) {
  return this.delete<void>(`/workout-logs/${workoutLogId}/items/${itemId}`);
  }
}
