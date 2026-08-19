import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Exercises, ExerciseDto } from '../../../core/services/exercises';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ExerciseDialog } from '../exercise-dialog/exercise-dialog';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './exercises-page.html',
  styleUrl: './exercises-page.scss',
})
export class ExercisesPage implements OnInit {
  private exercisesService = inject(Exercises);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  search = new FormControl('', { nonNullable: true });

  exercises: ExerciseDto[] = [];
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
    const ref = this.dialog.open(ExerciseDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) {
        this.pageNumber = 1;
        this.load();
      }
    });
  }

  openEditDialog(exercise: ExerciseDto): void {
    const ref = this.dialog.open(ExerciseDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { exercise },
    });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.load();
    });
  }

  confirmDelete(exercise: ExerciseDto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Delete exercise',
        message: 'Delete this exercise? This cannot be undone.',
        confirmLabel: 'Delete',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteExercise(exercise);
    });
  }

  private deleteExercise(exercise: ExerciseDto): void {
    this.exercisesService.deleteById(exercise.id).subscribe({
      next: () => {
        this.exercises = this.exercises.filter((e) => e.id !== exercise.id);
        this.snackBar.open('Exercise deleted', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
      error: (err) => {
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong deleting that exercise.';
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: 'app-snackbar' });
      },
    });
  }

  private load(): void {
    this.loading = true;
    const name = this.search.value.trim() || undefined;

    this.exercisesService
      .getAll({ name, pageNumber: this.pageNumber, pageSize: PAGE_SIZE })
      .subscribe({
        next: (exercises) => {
          this.exercises = exercises;
          this.hasNextPage = exercises.length === PAGE_SIZE;
          this.loading = false;
        },
        error: () => {
          this.exercises = [];
          this.hasNextPage = false;
          this.loading = false;
        },
      });
  }
}
