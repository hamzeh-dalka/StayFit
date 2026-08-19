import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Meals, MealDetailDto, MealItemDto } from '../../../core/services/meals';
import { MealDialog } from '../meal-dialog/meal-dialog';
import { AddMealItemDialog } from '../add-meal-item-dialog/add-meal-item-dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './meal-detail.html',
  styleUrl: './meal-detail.scss',
})
export class MealDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mealsService = inject(Meals);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  meal: MealDetailDto | null = null;
  loading = true;
  notFound = false;

  ngOnInit(): void {
    this.load();
  }

  get totalCalories(): number {
    if (!this.meal) return 0;
    return Math.round(
      this.meal.items.reduce((sum, item) => sum + (item.quantityInGrams / 100) * item.caloriesPer100g, 0),
    );
  }

  get formattedDateTime(): string {
    if (!this.meal) return '';
    return new Date(this.meal.loggedAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  itemCalories(item: MealItemDto): number {
    return Math.round((item.quantityInGrams / 100) * item.caloriesPer100g);
  }

  openEditDialog(): void {
    if (!this.meal) return;
    const ref = this.dialog.open(MealDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { meal: this.meal },
    });
    ref.afterClosed().subscribe((updated) => {
      if (updated) this.load();
    });
  }

  confirmDelete(): void {
    if (!this.meal) return;
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Delete this meal?',
        message: 'This will permanently remove this meal and its logged items.',
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed && this.meal) {
        this.mealsService.deleteById(this.meal.id).subscribe(() => {
          this.snackBar.open('Meal deleted', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
          this.router.navigateByUrl('/meals');
        });
      }
    });
  }

  openAddItemDialog(): void {
    if (!this.meal) return;
    const ref = this.dialog.open(AddMealItemDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { mealId: this.meal.id },
    });
    ref.afterClosed().subscribe((added) => {
      if (added) this.load();
    });
  }

  removeItem(item: MealItemDto): void {
    if (!this.meal) return;

    this.mealsService.removeItem(this.meal.id, item.id).subscribe({
      next: () => {
        if (this.meal) {
          this.meal = { ...this.meal, items: this.meal.items.filter((i) => i.id !== item.id) };
        }
        this.snackBar.open('Item removed', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: () => {
        this.snackBar.open('Something went wrong removing that item.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  private load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.mealsService.getById(id).subscribe({
      next: (meal) => {
        this.meal = meal;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }
}
