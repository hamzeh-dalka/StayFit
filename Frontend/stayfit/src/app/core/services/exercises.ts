import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface ExerciseDto {
  id: number;
  exerciseName: string;
  muscleGroup: string;
  caloriesBurnedPerMinute: number;
}

export interface FilterExercises {
  name?: string;
  muscleGroup?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveExerciseDto {
  exerciseName: string;
  muscleGroup: string;
  caloriesBurnedPerMinute: number;
}

@Injectable({ providedIn: 'root' })
export class Exercises extends BaseApi {
  getAll(filter: FilterExercises = {}) {
    return this.get<ExerciseDto[]>('/exercises', filter);
  }

  getById(id: number) {
    return this.get<ExerciseDto>(`/exercises/${id}`);
  }

  create(dto: SaveExerciseDto) {
    return this.post<ExerciseDto>('/exercises', dto);
  }

  update(id: number, dto: SaveExerciseDto) {
    return this.put<ExerciseDto>(`/exercises/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/exercises/${id}`);
  }
}
