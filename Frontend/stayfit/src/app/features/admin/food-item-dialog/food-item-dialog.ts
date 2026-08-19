import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FoodItems, FoodItemDto, SaveFoodItemDto } from '../../../core/services/food-items';

export interface FoodItemDialogData {
  foodItem?: FoodItemDto;
}

@Component({
  selector: 'app-food-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './food-item-dialog.html',
  styleUrl: './food-item-dialog.scss',
})
export class FoodItemDialog {
  private fb = inject(FormBuilder);
  private foodItemsService = inject(FoodItems);
  private dialogRef = inject(MatDialogRef<FoodItemDialog>);
  data = inject<FoodItemDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = !!this.data.foodItem;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    name: [this.data.foodItem?.name ?? '', Validators.required],
    caloriesPer100g: [
      this.data.foodItem?.caloriesPer100g ?? null,
      [Validators.required, Validators.min(0)],
    ],
    proteinPer100g: [
      this.data.foodItem?.proteinPer100g ?? null,
      [Validators.required, Validators.min(0)],
    ],
    carbsPer100g: [
      this.data.foodItem?.carbsPer100g ?? null,
      [Validators.required, Validators.min(0)],
    ],
    fatPer100g: [this.data.foodItem?.fatPer100g ?? null, [Validators.required, Validators.min(0)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveFoodItemDto = {
      name: raw.name!,
      caloriesPer100g: raw.caloriesPer100g!,
      proteinPer100g: raw.proteinPer100g!,
      carbsPer100g: raw.carbsPer100g!,
      fatPer100g: raw.fatPer100g!,
    };

    const request = this.isEdit
      ? this.foodItemsService.update(this.data.foodItem!.id, dto)
      : this.foodItemsService.create(dto);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage =
          typeof err?.error === 'string' ? err.error : 'Something went wrong. Please try again.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
