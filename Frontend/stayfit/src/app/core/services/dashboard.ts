import { Injectable } from '@angular/core';
import { BaseApi } from './base-api';

export interface AdminDashboardDto {
  totalUsers: number;
  totalCoaches: number;
  totalClients: number;
  totalFoodItems: number;
  totalExercises: number;
}

export interface SystemDashboardDto {
  totalMessages: number;
  totalNotifications: number;
  pendingCoachClientRequests: number;
  totalNutritionPlans: number;
  totalWorkoutPlans: number;
  lastUserRegisteredAt: string | null;
}

export interface CoachDashboardDto {
  totalClients: number;
  pendingRequests: number;
  activeNutritionPlans: number;
  activeWorkoutPlans: number;
}

export interface ClientDashboardDto {
  todayCalories: number;
  latestWeightKg: number | null;
  activeGoalsCount: number;
  workoutsThisWeek: number;
}

export interface PublicStatsDto {
  totalCoaches: number;
  totalWorkoutLogs: number;
  totalMeals: number;
}

@Injectable({ providedIn: 'root' })
export class Dashboard extends BaseApi {
  getAdmin() {
    return this.get<AdminDashboardDto>('/dashboard/admin');
  }

  getSystem() {
    return this.get<SystemDashboardDto>('/dashboard/system');
  }

  getCoach() {
    return this.get<CoachDashboardDto>('/dashboard/coach');
  }

  getClient() {
    return this.get<ClientDashboardDto>('/dashboard/client');
  }

  getPublicStats() {
    return this.get<PublicStatsDto>('/dashboard/public-stats');
  }
}
