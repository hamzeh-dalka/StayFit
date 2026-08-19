import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface FoodItemDto {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface FilterFoodItems {
  name?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface SaveFoodItemDto {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

@Injectable({ providedIn: 'root' })
export class FoodItems extends BaseApi {
  getAll(filter: FilterFoodItems = {}) {
    return this.get<FoodItemDto[]>('/food-items', filter);
  }

  getById(id: number) {
    return this.get<FoodItemDto>(`/food-items/${id}`);
  }

  create(dto: SaveFoodItemDto) {
    return this.post<FoodItemDto>('/food-items', dto);
  }

  update(id: number, dto: SaveFoodItemDto) {
    return this.put<FoodItemDto>(`/food-items/${id}`, dto);
  }

  deleteById(id: number) {
    return this.delete<void>(`/food-items/${id}`);
  }
}
