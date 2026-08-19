import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';
import { MealType } from '../models/enums';

export interface MealDto {
  id: number;
  mealType: MealType;
  loggedAt: string;
}

export interface MealItemDto {
  id: number;
  foodItemId: number;
  foodItemName: string;
  quantityInGrams: number;
  caloriesPer100g: number;
}

export interface MealDetailDto {
  id: number;
  mealType: MealType;
  loggedAt: string;
  items: MealItemDto[];
}

export interface FilterMeals {
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveMealDto {
  mealType: MealType;
  loggedAt: string;
}

export interface AddMealItemDto {
  foodItemId: number;
  quantityInGrams: number;
}

@Injectable({ providedIn: 'root' })
export class Meals extends BaseApi {
  getAll(filter: FilterMeals = {}) {
    return this.get<MealDto[]>('/meals', filter);
  }

  getById(id: number) {
    return this.get<MealDetailDto>(`/meals/${id}`);
  }

  create(dto: SaveMealDto) {
    return this.post<MealDto>('/meals', dto);
  }

  update(id: number, dto: SaveMealDto) {
    return this.put<MealDto>(`/meals/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/meals/${id}`);
  }

  addItem(mealId: number, dto: AddMealItemDto) {
    return this.post<void>(`/meals/${mealId}/items`, dto);
  }

  removeItem(mealId: number, itemId: number) {
    return this.delete<void>(`/meals/${mealId}/items/${itemId}`);
  }
}
