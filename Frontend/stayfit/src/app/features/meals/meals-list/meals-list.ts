import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Meals, MealDto } from '../../../core/services/meals';
import { MealType } from '../../../core/models/enums';
import { formatRelativeDate } from '../../../core/utils/format-relative-date';
import { MealDialog } from '../meal-dialog/meal-dialog';

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  [MealType.Breakfast]: 'wb_sunny',
  [MealType.Lunch]: 'lunch_dining',
  [MealType.Dinner]: 'nights_stay',
  [MealType.Snack]: 'cookie',
};

@Component({
  selector: 'app-meals-list',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './meals-list.html',
  styleUrl: './meals-list.scss',
})
export class MealsList implements OnInit {
  private mealsService = inject(Meals);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  meals: MealDto[] = [];
  loading = true;

  formatRelativeDate = formatRelativeDate;

  ngOnInit(): void {
    this.load();
  }

  mealIcon(type: MealType): string {
    return MEAL_TYPE_ICONS[type];
  }

  openRow(meal: MealDto): void {
    this.router.navigate(['/meals', meal.id]);
  }

  openAddDialog(): void {
    const ref = this.dialog.open(MealDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((created) => {
      if (created) this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.mealsService.getAll().subscribe({
      next: (meals) => {
        this.meals = meals;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
