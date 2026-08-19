import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface NutritionPlanDto {
  id: number;
  title: string;
  createdAt: string;
  coachName: string;
  clientName: string;
}

export interface PlanMealItemDto {
  id: number;
  foodItemId: number;
  foodItemName: string;
  quantityGrams: number;
  dayOfWeek: number;
}

export interface NutritionPlanDetailDto {
  id: number;
  title: string;
  createdAt: string;
  coachName: string;
  clientName: string;
  items: PlanMealItemDto[];
}

export interface SaveNutritionPlanDto {
  clientProfileId: number;
  title: string;
}

export interface AddPlanMealItemDto {
  foodItemId: number;
  quantityGrams: number;
  dayOfWeek: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionPlans extends BaseApi {
  getAll() {
    return this.get<NutritionPlanDto[]>('/nutrition-plans');
  }

  getById(id: number) {
    return this.get<NutritionPlanDetailDto>(`/nutrition-plans/${id}`);
  }

  create(dto: SaveNutritionPlanDto) {
    return this.post<NutritionPlanDto>('/nutrition-plans', dto);
  }

  update(id: number, dto: SaveNutritionPlanDto) {
    return this.put<NutritionPlanDto>(`/nutrition-plans/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/nutrition-plans/${id}`);
  }

  addItem(planId: number, dto: AddPlanMealItemDto) {
    return this.post<void>(`/nutrition-plans/${planId}/items`, dto);
  }
}
