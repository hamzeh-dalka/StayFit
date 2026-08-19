import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Meals } from '../../../core/services/meals';
import { FoodItems, FoodItemDto } from '../../../core/services/food-items';

export interface AddMealItemDialogData {
  mealId: number;
}

@Component({
  selector: 'app-add-meal-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatAutocompleteModule],
  templateUrl: './add-meal-item-dialog.html',
  styleUrl: './add-meal-item-dialog.scss',
})
export class AddMealItemDialog implements OnInit {
  private fb = inject(FormBuilder);
  private mealsService = inject(Meals);
  private foodItemsService = inject(FoodItems);
  private dialogRef = inject(MatDialogRef<AddMealItemDialog>);
  private destroyRef = inject(DestroyRef);
  data = inject<AddMealItemDialogData>(MAT_DIALOG_DATA);

  searchResults: FoodItemDto[] = [];
  searching = false;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    foodItem: [null as FoodItemDto | string | null, Validators.required],
    quantityInGrams: [100, [Validators.required, Validators.min(1)]],
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

    const quantityInGrams = this.form.getRawValue().quantityInGrams!;

    this.mealsService.addItem(this.data.mealId, { foodItemId: foodItem.id, quantityInGrams }).subscribe({
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
