import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { NutritionPlans } from '../../../core/services/nutrition-plans';
import { FoodItems, FoodItemDto } from '../../../core/services/food-items';
import { dayOfWeekLabel } from '../../../core/utils/day-of-week-label';

export interface AddPlanMealItemDialogData {
  planId: number;
}

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

@Component({
  selector: 'app-add-plan-meal-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatAutocompleteModule],
  templateUrl: './add-plan-meal-item-dialog.html',
  styleUrl: './add-plan-meal-item-dialog.scss',
})
export class AddPlanMealItemDialog implements OnInit {
  private fb = inject(FormBuilder);
  private nutritionPlansService = inject(NutritionPlans);
  private foodItemsService = inject(FoodItems);
  private dialogRef = inject(MatDialogRef<AddPlanMealItemDialog>);
  private destroyRef = inject(DestroyRef);
  data = inject<AddPlanMealItemDialogData>(MAT_DIALOG_DATA);

  days = DAYS_OF_WEEK;
  dayLabel = dayOfWeekLabel;

  searchResults: FoodItemDto[] = [];
  searching = false;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    foodItem: [null as FoodItemDto | string | null, Validators.required],
    quantityGrams: [100, [Validators.required, Validators.min(1)]],
    dayOfWeek: [new Date().getDay(), Validators.required],
  });

  ngOnInit(): void {
    this.form.controls.foodItem.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const term = typeof value === 'string' ? value.trim() : '';
          if (term.length < 2) {
            this.searching = false;
            return of([] as FoodItemDto[]);
          }
          this.searching = true;
          return this.foodItemsService.getAll({ name: term }).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searching = false;
        this.searchResults = results;
      });
  }

  get hasQuery(): boolean {
    const value = this.form.controls.foodItem.value;
    return typeof value === 'string' && value.trim().length >= 2;
  }

  displayFoodItem = (item: FoodItemDto | string | null): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.name;
  };

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.form.controls.foodItem.setValue(event.option.value);
    this.searchResults = [];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const foodItem = this.form.controls.foodItem.value;
    if (typeof foodItem !== 'object' || foodItem === null) {
      this.errorMessage = 'Please select a food item from the list.';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();

    this.nutritionPlansService
      .addItem(this.data.planId, {
        foodItemId: foodItem.id,
        quantityGrams: raw.quantityGrams!,
        dayOfWeek: raw.dayOfWeek!,
      })
      .subscribe({
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
