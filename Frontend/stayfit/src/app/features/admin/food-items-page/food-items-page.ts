import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FoodItems, FoodItemDto } from '../../../core/services/food-items';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FoodItemDialog } from '../food-item-dialog/food-item-dialog';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-food-items-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './food-items-page.html',
  styleUrl: './food-items-page.scss',
})
export class FoodItemsPage implements OnInit {
  private foodItemsService = inject(FoodItems);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  search = new FormControl('', { nonNullable: true });

  foodItems: FoodItemDto[] = [];
  loading = true;
  pageNumber = 1;
  hasNextPage = false;

  ngOnInit(): void {
    this.load();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pageNumber = 1;
        this.load();
      });
  }

  prevPage(): void {
    if (this.pageNumber <= 1) return;
    this.pageNumber -= 1;
    this.load();
  }

  nextPage(): void {
    if (!this.hasNextPage) return;
    this.pageNumber += 1;
    this.load();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(FoodItemDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) {
        this.pageNumber = 1;
        this.load();
      }
    });
  }

  openEditDialog(foodItem: FoodItemDto): void {
    const ref = this.dialog.open(FoodItemDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { foodItem },
    });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.load();
    });
  }

  confirmDelete(foodItem: FoodItemDto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Delete food item',
        message: 'Delete this food item? This cannot be undone.',
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteFoodItem(foodItem);
    });
  }

  private deleteFoodItem(foodItem: FoodItemDto): void {
    this.foodItemsService.deleteById(foodItem.id).subscribe({
      next: () => {
        this.foodItems = this.foodItems.filter((f) => f.id !== foodItem.id);
        this.snackBar.open('Food item deleted', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
      error: (err) => {
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong deleting that food item.';
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: 'app-snackbar' });
      },
    });
  }

  private load(): void {
    this.loading = true;
    const name = this.search.value.trim() || undefined;

    this.foodItemsService
      .getAll({ name, pageNumber: this.pageNumber, pageSize: PAGE_SIZE })
      .subscribe({
        next: (foodItems) => {
          this.foodItems = foodItems;
          this.hasNextPage = foodItems.length === PAGE_SIZE;
          this.loading = false;
        },
        error: () => {
          this.foodItems = [];
          this.hasNextPage = false;
          this.loading = false;
        },
      });
  }
}
