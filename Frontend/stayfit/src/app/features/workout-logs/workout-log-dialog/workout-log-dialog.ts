import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WorkoutLogs, WorkoutLogDto, SaveWorkoutLogDto } from '../../../core/services/workout-logs';

export interface WorkoutLogDialogData {
  workoutLog?: WorkoutLogDto;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

@Component({
  selector: 'app-workout-log-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './workout-log-dialog.html',
  styleUrl: './workout-log-dialog.scss',
})
export class WorkoutLogDialog {
  private fb = inject(FormBuilder);
  private workoutLogsService = inject(WorkoutLogs);
  private dialogRef = inject(MatDialogRef<WorkoutLogDialog>);
  data = inject<WorkoutLogDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = !!this.data.workoutLog;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    date: [this.initialDate(), Validators.required],
    time: [this.initialTime(), Validators.required],
    durationMinutes: [this.data.workoutLog?.durationMinutes ?? 30, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveWorkoutLogDto = {
      loggedAt: `${raw.date}T${raw.time}:00`,
      durationMinutes: raw.durationMinutes!,
    };

    const request = this.isEdit
      ? this.workoutLogsService.update(this.data.workoutLog!.id, dto)
      : this.workoutLogsService.create(dto);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private initialDate(): string {
    if (this.data.workoutLog) return this.data.workoutLog.loggedAt.slice(0, 10);
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  private initialTime(): string {
    if (this.data.workoutLog) return this.data.workoutLog.loggedAt.slice(11, 16);
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
