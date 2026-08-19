import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NutritionPlans, NutritionPlanDto } from '../../../core/services/nutrition-plans';
import { CoachClientDto } from '../../../core/services/coach-client';

export interface NewNutritionPlanDialogData {
  clients: CoachClientDto[];
  preselectClientProfileId: number | null;
}

@Component({
  selector: 'app-new-nutrition-plan-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './new-nutrition-plan-dialog.html',
  styleUrl: './new-nutrition-plan-dialog.scss',
})
export class NewNutritionPlanDialog {
  private fb = inject(FormBuilder);
  private nutritionPlansService = inject(NutritionPlans);
  private dialogRef = inject(MatDialogRef<NewNutritionPlanDialog>);
  data = inject<NewNutritionPlanDialogData>(MAT_DIALOG_DATA);

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

    this.nutritionPlansService
      .create({ clientProfileId: raw.clientProfileId!, title: raw.title! })
      .subscribe({
        next: (created: NutritionPlanDto) => {
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
