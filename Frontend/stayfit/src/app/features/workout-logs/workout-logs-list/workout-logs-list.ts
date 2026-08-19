import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { WorkoutLogs, WorkoutLogDto } from '../../../core/services/workout-logs';
import { formatRelativeDate } from '../../../core/utils/format-relative-date';
import { WorkoutLogDialog } from '../workout-log-dialog/workout-log-dialog';

@Component({
  selector: 'app-workout-logs-list',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './workout-logs-list.html',
  styleUrl: './workout-logs-list.scss',
})
export class WorkoutLogsList implements OnInit {
  private workoutLogsService = inject(WorkoutLogs);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  workoutLogs: WorkoutLogDto[] = [];
  loading = true;

  formatRelativeDate = formatRelativeDate;

  ngOnInit(): void {
    this.load();
  }

  openRow(log: WorkoutLogDto): void {
    this.router.navigate(['/workout-logs', log.id]);
  }

  openAddDialog(): void {
    const ref = this.dialog.open(WorkoutLogDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((created) => {
      if (created) this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.workoutLogsService.getAll().subscribe({
      next: (logs) => {
        this.workoutLogs = logs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
