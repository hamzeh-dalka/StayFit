import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { WorkoutLogs, WorkoutLogDetailDto, WorkoutLogItemDto } from '../../../core/services/workout-logs';
import { WorkoutLogDialog } from '../workout-log-dialog/workout-log-dialog';
import { AddWorkoutItemDialog } from '../add-workout-item-dialog/add-workout-item-dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-workout-log-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './workout-log-detail.html',
  styleUrl: './workout-log-detail.scss',
})
export class WorkoutLogDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutLogsService = inject(WorkoutLogs);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  workoutLog: WorkoutLogDetailDto | null = null;
  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.load();
  }

  get formattedDateTime(): string {
    if (!this.workoutLog) return '';
    return new Date(this.workoutLog.loggedAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  openEditDialog(): void {
    if (!this.workoutLog) return;
    const ref = this.dialog.open(WorkoutLogDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { workoutLog: this.workoutLog },
    });
    ref.afterClosed().subscribe((updated) => {
      if (updated) this.load();
    });
  }

  confirmDelete(): void {
    if (!this.workoutLog) return;
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Delete this workout?',
        message: 'This will permanently remove this workout session and its logged exercises.',
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.workoutLog) {
        this.workoutLogsService.deleteById(this.workoutLog.id).subscribe(() => {
          this.snackBar.open('Workout deleted', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
          this.router.navigateByUrl('/workout-logs');
        });
      }
    });
  }

  openAddItemDialog(): void {
    if (!this.workoutLog) return;
    const ref = this.dialog.open(AddWorkoutItemDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { workoutLogId: this.workoutLog.id },
    });
    ref.afterClosed().subscribe((added) => {
      if (added) this.load();
    });
  }

  removeItem(item: WorkoutLogItemDto): void {
    if (!this.workoutLog) return;

    this.workoutLogsService.removeItem(this.workoutLog.id, item.id).subscribe({
      next: () => {
        if (this.workoutLog) {
          this.workoutLog = {
            ...this.workoutLog,
            items: this.workoutLog.items.filter((i) => i.id !== item.id),
          };
        }
        this.snackBar.open('Exercise removed', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: () => {
        this.snackBar.open('Something went wrong removing that exercise.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  private load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.workoutLogsService.getById(id).subscribe({
      next: (workoutLog) => {
        this.workoutLog = workoutLog;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }
}
