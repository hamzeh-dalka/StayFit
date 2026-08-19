import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface WorkoutPlanDto {
  id: number;
  title: string;
  createdAt: string;
  coachName: string;
  clientName: string;
}

export interface PlanExerciseItemDto {
  id: number;
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: number;
  dayOfWeek: number;
}

export interface WorkoutPlanDetailDto {
  id: number;
  title: string;
  createdAt: string;
  coachName: string;
  clientName: string;
  items: PlanExerciseItemDto[];
}

export interface SaveWorkoutPlanDto {
  clientProfileId: number;
  title: string;
}

export interface AddPlanExerciseItemDto {
  exerciseId: number;
  sets: number;
  reps: number;
  dayOfWeek: number;
}

@Injectable({ providedIn: 'root' })
export class WorkoutPlans extends BaseApi {
  getAll() {
    return this.get<WorkoutPlanDto[]>('/workout-plans');
  }

  getById(id: number) {
    return this.get<WorkoutPlanDetailDto>(`/workout-plans/${id}`);
  }

  create(dto: SaveWorkoutPlanDto) {
    return this.post<WorkoutPlanDto>('/workout-plans', dto);
  }

  update(id: number, dto: SaveWorkoutPlanDto) {
    return this.put<WorkoutPlanDto>(`/workout-plans/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/workout-plans/${id}`);
  }

  addItem(planId: number, dto: AddPlanExerciseItemDto) {
    return this.post<void>(`/workout-plans/${planId}/items`, dto);
  }
}
