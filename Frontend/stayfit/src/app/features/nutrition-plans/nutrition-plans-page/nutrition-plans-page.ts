import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import {
  NutritionPlans,
  NutritionPlanDto,
  NutritionPlanDetailDto,
} from '../../../core/services/nutrition-plans';
import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';
import { dayOfWeekLabel } from '../../../core/utils/day-of-week-label';
import { NewNutritionPlanDialog } from '../new-nutrition-plan-dialog/new-nutrition-plan-dialog';
import { AddPlanMealItemDialog } from '../add-plan-meal-item-dialog/add-plan-meal-item-dialog';

@Component({
  selector: 'app-nutrition-plans-page',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './nutrition-plans-page.html',
  styleUrl: './nutrition-plans-page.scss',
})
export class NutritionPlansPage implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private nutritionPlansService = inject(NutritionPlans);
  private coachClientService = inject(CoachClient);

  dayLabel = dayOfWeekLabel;

  loadingList = signal(true);
  loadingDetail = signal(false);

  plans = signal<NutritionPlanDto[]>([]);
  clients = signal<CoachClientDto[]>([]);

  selectedPlan = signal<NutritionPlanDetailDto | null>(null);
  selectedDay = signal<number | null>(null);

  private detailCache = new Map<number, NutritionPlanDetailDto>();

  availableDays = computed(() => {
    const plan = this.selectedPlan();
    if (!plan) return [];
    const days = new Set(plan.items.map((item) => item.dayOfWeek));
    return Array.from(days).sort((a, b) => a - b);
  });

  dayItems = computed(() => {
    const plan = this.selectedPlan();
    const day = this.selectedDay();
    if (!plan || day === null) return [];
    return plan.items.filter((item) => item.dayOfWeek === day);
  });

  ngOnInit(): void {
    this.loadingList.set(true);

    forkJoin({
      plans: this.nutritionPlansService.getAll(),
      clients: this.coachClientService.getMyClients(),
    }).subscribe({
      next: ({ plans, clients }) => {
        this.plans.set(plans);
        this.clients.set(clients.filter((c) => c.status === CoachClientStatus.Accepted));
        this.loadingList.set(false);
        this.maybeAutoOpenCreateDialog();
      },
      error: () => this.loadingList.set(false),
    });
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  selectPlan(planId: number): void {
    const cached = this.detailCache.get(planId);
    if (cached) {
      this.selectedPlan.set(cached);
      this.syncSelectedDay(cached.items);
      return;
    }

    this.loadingDetail.set(true);
    this.nutritionPlansService.getById(planId).subscribe({
      next: (detail) => {
        this.detailCache.set(planId, detail);
        this.selectedPlan.set(detail);
        this.syncSelectedDay(detail.items);
        this.loadingDetail.set(false);
      },
      error: () => this.loadingDetail.set(false),
    });
  }

  selectDay(day: number): void {
    this.selectedDay.set(day);
  }

  openCreateDialog(preselectClientProfileId: number | null = null): void {
    const ref = this.dialog.open(NewNutritionPlanDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { clients: this.clients(), preselectClientProfileId },
    });

    ref.afterClosed().subscribe((created: NutritionPlanDto | null) => {
      if (created) {
        this.plans.update((list) => [created, ...list]);
        this.selectPlan(created.id);
      }
    });
  }

  openAddItemDialog(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    const ref = this.dialog.open(AddPlanMealItemDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { planId: plan.id },
    });

    ref.afterClosed().subscribe((added: boolean) => {
      if (added) this.refreshSelectedPlan(plan.id);
    });
  }

  private refreshSelectedPlan(planId: number): void {
    this.loadingDetail.set(true);
    this.nutritionPlansService.getById(planId).subscribe({
      next: (detail) => {
        this.detailCache.set(planId, detail);
        this.selectedPlan.set(detail);
        this.syncSelectedDay(detail.items);
        this.loadingDetail.set(false);
      },
      error: () => this.loadingDetail.set(false),
    });
  }

  private syncSelectedDay(items: { dayOfWeek: number }[]): void {
    const days = Array.from(new Set(items.map((item) => item.dayOfWeek))).sort((a, b) => a - b);
    const current = this.selectedDay();
    if (current === null || !days.includes(current)) {
      this.selectedDay.set(days.length ? days[0] : null);
    }
  }

  private maybeAutoOpenCreateDialog(): void {
    const raw = this.route.snapshot.queryParamMap.get('clientProfileId');
    if (!raw) return;
    const clientProfileId = Number(raw);
    if (Number.isNaN(clientProfileId)) return;
    this.openCreateDialog(clientProfileId);
  }
}
