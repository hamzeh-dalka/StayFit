import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { WorkoutPlans, WorkoutPlanDto } from '../../../core/services/workout-plans';
import { CoachClientDto } from '../../../core/services/coach-client';

export interface NewWorkoutPlanDialogData {
  clients: CoachClientDto[];
  preselectClientProfileId: number | null;
}

@Component({
  selector: 'app-new-workout-plan-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './new-workout-plan-dialog.html',
  styleUrl: './new-workout-plan-dialog.scss',
})
export class NewWorkoutPlanDialog {
  private fb = inject(FormBuilder);
  private workoutPlansService = inject(WorkoutPlans);
  private dialogRef = inject(MatDialogRef<NewWorkoutPlanDialog>);
  data = inject<NewWorkoutPlanDialogData>(MAT_DIALOG_DATA);

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    clientProfileId: [this.data.preselectClientProfileId, Validators.required],
    title: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();

    this.workoutPlansService
      .create({ clientProfileId: raw.clientProfileId!, title: raw.title! })
      .subscribe({
        next: (created: WorkoutPlanDto) => {
          this.submitting = false;
          this.dialogRef.close(created);
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Something went wrong. Please try again.';
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
