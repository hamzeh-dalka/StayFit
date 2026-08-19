import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { WeightLogs, SaveWeightLogDto } from '../../../core/services/weight-logs';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

@Component({
  selector: 'app-weight-log-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './weight-log-dialog.html',
  styleUrl: './weight-log-dialog.scss',
})
export class WeightLogDialog {
  private fb = inject(FormBuilder);
  private weightLogsService = inject(WeightLogs);
  private dialogRef = inject(MatDialogRef<WeightLogDialog>);

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    weightKg: [null as number | null, [Validators.required, Validators.min(20), Validators.max(400)]],
    date: [this.initialDate(), Validators.required],
    time: [this.initialTime(), Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveWeightLogDto = {
      weightKg: raw.weightKg!,
      recordedAt: `${raw.date}T${raw.time}:00`,
    };

    this.weightLogsService.create(dto).subscribe({
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
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  private initialTime(): string {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
