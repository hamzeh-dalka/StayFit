import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Goals, GoalDto, SaveGoalDto } from '../../../core/services/goals';
import { GoalType } from '../../../core/models/enums';

export interface GoalDialogData {
  goal?: GoalDto;
}

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.WeightLoss]: 'Weight loss',
  [GoalType.MuscleGain]: 'Muscle gain',
  [GoalType.Maintenance]: 'Maintenance',
};

@Component({
  selector: 'app-goal-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './goal-dialog.html',
  styleUrl: './goal-dialog.scss',
})
export class GoalDialog {
  private fb = inject(FormBuilder);
  private goalsService = inject(Goals);
  private dialogRef = inject(MatDialogRef<GoalDialog>);
  data = inject<GoalDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = !!this.data.goal;
  goalTypes = Object.values(GoalType);

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    goalType: [this.data.goal?.goalType ?? GoalType.WeightLoss, Validators.required],
    targetValue: [this.data.goal?.targetValue ?? null, [Validators.required, Validators.min(0)]],
    currentValue: [this.data.goal?.currentValue ?? 0, [Validators.required, Validators.min(0)]],
    deadline: [this.data.goal?.deadline ?? '', Validators.required],
  });

  goalTypeLabel(type: GoalType): string {
    return GOAL_TYPE_LABELS[type];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveGoalDto = {
      goalType: raw.goalType as GoalType,
      targetValue: raw.targetValue!,
      currentValue: raw.currentValue!,
      deadline: raw.deadline!,
    };

    const request = this.isEdit ? this.goalsService.update(this.data.goal!.id, dto) : this.goalsService.create(dto);

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
}
