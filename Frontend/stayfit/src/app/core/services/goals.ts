import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { GoalType } from '../models/enums';

export interface GoalDto {
  id: number;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  deadline: string;
}

export interface SaveGoalDto {
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  deadline: string;
}

@Injectable({ providedIn: 'root' })
export class Goals extends BaseApi {
  getAll() {
    return this.get<GoalDto[]>('/goals');
  }

  create(dto: SaveGoalDto) {
    return this.post<GoalDto>('/goals', dto);
  }

  update(id: number, dto: SaveGoalDto) {
    return this.put<GoalDto>(`/goals/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/goals/${id}`);
  }
}
