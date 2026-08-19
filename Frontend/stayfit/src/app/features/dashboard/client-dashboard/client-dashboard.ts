import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth';
import { Dashboard, ClientDashboardDto } from '../../../core/services/dashboard';
import { Meals, MealDto } from '../../../core/services/meals';
import { WeightLogs, WeightLogDto } from '../../../core/services/weight-logs';
import { formatRelativeDate } from '../../../core/utils/format-relative-date';
import { buildSparkline, SparklineData } from '../../../core/utils/build-sparkline';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.scss',
})
export class ClientDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboard = inject(Dashboard);
  private mealsService = inject(Meals);
  private weightLogsService = inject(WeightLogs);

  currentUser = this.authService.currentUser;

  stats: ClientDashboardDto | null = null;
  statsLoading = true;

  meals: MealDto[] = [];
  mealsLoading = true;

  weightLogs: WeightLogDto[] = [];
  weightLoading = true;

  ngOnInit(): void {
    this.dashboard.getClient().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
      },
    });

    this.mealsService.getAll({ pageSize: 3 }).subscribe({
      next: (meals) => {
        this.meals = meals;
        this.mealsLoading = false;
      },
      error: () => {
        this.mealsLoading = false;
      },
    });

    this.weightLogsService.getAll({ pageSize: 6 }).subscribe({
      next: (logs) => {
        this.weightLogs = logs;
        this.weightLoading = false;
      },
      error: () => {
        this.weightLoading = false;
      },
    });
  }

  get latestWeightLabel(): string {
    const weight = this.stats?.latestWeightKg;
    return weight === null || weight === undefined ? '—' : `${weight} kg`;
  }

  get chart(): SparklineData | null {
    // Backend returns newest-first; the chart reads oldest-to-newest, left-to-right.
    const points = [...this.weightLogs].reverse();
    return buildSparkline(points.map((p) => p.weightKg));
  }

  formatRelativeDate = formatRelativeDate;
}
