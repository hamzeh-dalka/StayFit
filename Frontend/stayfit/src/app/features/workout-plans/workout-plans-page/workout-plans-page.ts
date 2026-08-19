import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import {
  WorkoutPlans,
  WorkoutPlanDto,
  WorkoutPlanDetailDto,
} from '../../../core/services/workout-plans';
import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';
import { dayOfWeekLabel } from '../../../core/utils/day-of-week-label';
import { NewWorkoutPlanDialog } from '../new-workout-plan-dialog/new-workout-plan-dialog';
import { AddPlanExerciseItemDialog } from '../add-plan-exercise-item-dialog/add-plan-exercise-item-dialog';

@Component({
  selector: 'app-workout-plans-page',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './workout-plans-page.html',
  styleUrl: './workout-plans-page.scss',
})
export class WorkoutPlansPage implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private workoutPlansService = inject(WorkoutPlans);
  private coachClientService = inject(CoachClient);

  dayLabel = dayOfWeekLabel;

  loadingList = signal(true);
  loadingDetail = signal(false);

  plans = signal<WorkoutPlanDto[]>([]);
  clients = signal<CoachClientDto[]>([]);

  selectedPlan = signal<WorkoutPlanDetailDto | null>(null);
  selectedDay = signal<number | null>(null);

  private detailCache = new Map<number, WorkoutPlanDetailDto>();

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
      plans: this.workoutPlansService.getAll(),
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
    this.workoutPlansService.getById(planId).subscribe({
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
    const ref = this.dialog.open(NewWorkoutPlanDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { clients: this.clients(), preselectClientProfileId },
    });

    ref.afterClosed().subscribe((created: WorkoutPlanDto | null) => {
      if (created) {
        this.plans.update((list) => [created, ...list]);
        this.selectPlan(created.id);
      }
    });
  }

  openAddItemDialog(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    const ref = this.dialog.open(AddPlanExerciseItemDialog, {
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
    this.workoutPlansService.getById(planId).subscribe({
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
