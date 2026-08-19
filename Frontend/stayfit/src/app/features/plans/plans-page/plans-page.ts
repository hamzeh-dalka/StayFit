import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  NutritionPlans,
  NutritionPlanDto,
  NutritionPlanDetailDto,
  PlanMealItemDto,
} from '../../../core/services/nutrition-plans';
import {
  WorkoutPlans,
  WorkoutPlanDto,
  WorkoutPlanDetailDto,
  PlanExerciseItemDto,
} from '../../../core/services/workout-plans';
import { dayOfWeekLabel } from '../../../core/utils/day-of-week-label';

type PlanTab = 'nutrition' | 'workout';

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './plans-page.html',
  styleUrl: './plans-page.scss',
})
export class PlansPage implements OnInit {
  private nutritionPlansService = inject(NutritionPlans);
  private workoutPlansService = inject(WorkoutPlans);

  dayLabel = dayOfWeekLabel;

  activeTab = signal<PlanTab>('nutrition');
  loadingList = signal(false);
  loadingDetail = signal(false);

  nutritionPlans = signal<NutritionPlanDto[] | null>(null);
  workoutPlans = signal<WorkoutPlanDto[] | null>(null);

  selectedNutritionPlan = signal<NutritionPlanDetailDto | null>(null);
  selectedWorkoutPlan = signal<WorkoutPlanDetailDto | null>(null);
  selectedDay = signal<number | null>(null);

  private nutritionDetailCache = new Map<number, NutritionPlanDetailDto>();
  private workoutDetailCache = new Map<number, WorkoutPlanDetailDto>();

  currentPlans = computed<NutritionPlanDto[] | WorkoutPlanDto[] | null>(() =>
    this.activeTab() === 'nutrition' ? this.nutritionPlans() : this.workoutPlans(),
  );

  currentSelectedPlan = computed<NutritionPlanDetailDto | WorkoutPlanDetailDto | null>(() =>
    this.activeTab() === 'nutrition' ? this.selectedNutritionPlan() : this.selectedWorkoutPlan(),
  );

  currentSelectedPlanId = computed(() => this.currentSelectedPlan()?.id ?? null);

  availableDays = computed(() => {
    const plan = this.currentSelectedPlan();
    if (!plan) return [];
    const days = new Set(plan.items.map((item) => item.dayOfWeek));
    return Array.from(days).sort((a, b) => a - b);
  });

  nutritionDayItems = computed<PlanMealItemDto[]>(() => {
    const plan = this.selectedNutritionPlan();
    const day = this.selectedDay();
    if (!plan || day === null) return [];
    return plan.items.filter((item) => item.dayOfWeek === day);
  });

  workoutDayItems = computed<PlanExerciseItemDto[]>(() => {
    const plan = this.selectedWorkoutPlan();
    const day = this.selectedDay();
    if (!plan || day === null) return [];
    return plan.items.filter((item) => item.dayOfWeek === day);
  });

  ngOnInit(): void {
    this.loadNutritionPlans();
  }

  selectTab(tab: PlanTab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    if (tab === 'nutrition') {
      this.loadNutritionPlans();
    } else {
      this.loadWorkoutPlans();
    }
  }

  selectPlan(planId: number): void {
    if (this.activeTab() === 'nutrition') {
      this.selectNutritionPlan(planId);
    } else {
      this.selectWorkoutPlan(planId);
    }
  }

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private selectNutritionPlan(planId: number): void {
    const cached = this.nutritionDetailCache.get(planId);
    if (cached) {
      this.selectedNutritionPlan.set(cached);
      this.selectedDay.set(this.firstDay(cached.items));
      return;
    }

    this.loadingDetail.set(true);
    this.nutritionPlansService.getById(planId).subscribe({
      next: (detail) => {
        this.nutritionDetailCache.set(planId, detail);
        this.selectedNutritionPlan.set(detail);
        this.selectedDay.set(this.firstDay(detail.items));
        this.loadingDetail.set(false);
      },
      error: () => this.loadingDetail.set(false),
    });
  }

  private selectWorkoutPlan(planId: number): void {
    const cached = this.workoutDetailCache.get(planId);
    if (cached) {
      this.selectedWorkoutPlan.set(cached);
      this.selectedDay.set(this.firstDay(cached.items));
      return;
    }

    this.loadingDetail.set(true);
    this.workoutPlansService.getById(planId).subscribe({
      next: (detail) => {
        this.workoutDetailCache.set(planId, detail);
        this.selectedWorkoutPlan.set(detail);
        this.selectedDay.set(this.firstDay(detail.items));
        this.loadingDetail.set(false);
      },
      error: () => this.loadingDetail.set(false),
    });
  }

  private firstDay(items: { dayOfWeek: number }[]): number | null {
    return items.length ? Math.min(...items.map((item) => item.dayOfWeek)) : null;
  }

  private loadNutritionPlans(): void {
    if (this.nutritionPlans() !== null) return;

    this.loadingList.set(true);
    this.nutritionPlansService.getAll().subscribe({
      next: (plans) => {
        this.nutritionPlans.set(plans);
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false),
    });
  }

  private loadWorkoutPlans(): void {
    if (this.workoutPlans() !== null) return;

    this.loadingList.set(true);
    this.workoutPlansService.getAll().subscribe({
      next: (plans) => {
        this.workoutPlans.set(plans);
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false),
    });
  }
}
