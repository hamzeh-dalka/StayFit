import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Meals, MealDto, SaveMealDto } from '../../../core/services/meals';
import { MealType } from '../../../core/models/enums';

export interface MealDialogData {
  meal?: MealDto;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Lunch]: 'Lunch',
  [MealType.Dinner]: 'Dinner',
  [MealType.Snack]: 'Snack',
};

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

@Component({
  selector: 'app-meal-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './meal-dialog.html',
  styleUrl: './meal-dialog.scss',
})
export class MealDialog {
  private fb = inject(FormBuilder);
  private mealsService = inject(Meals);
  private dialogRef = inject(MatDialogRef<MealDialog>);
  data = inject<MealDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = !!this.data.meal;
  mealTypes = Object.values(MealType);

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    mealType: [this.data.meal?.mealType ?? MealType.Breakfast, Validators.required],
    date: [this.initialDate(), Validators.required],
    time: [this.initialTime(), Validators.required],
  });

  mealTypeLabel(type: MealType): string {
    return MEAL_TYPE_LABELS[type];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveMealDto = {
      mealType: raw.mealType as MealType,
      loggedAt: `${raw.date}T${raw.time}:00`,
    };

    const request = this.isEdit
      ? this.mealsService.update(this.data.meal!.id, dto)
      : this.mealsService.create(dto);

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
    if (this.data.meal) return this.data.meal.loggedAt.slice(0, 10);
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  private initialTime(): string {
    if (this.data.meal) return this.data.meal.loggedAt.slice(11, 16);
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
