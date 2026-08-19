import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { WorkoutLogs } from '../../../core/services/workout-logs';
import { Exercises, ExerciseDto } from '../../../core/services/exercises';

export interface AddWorkoutItemDialogData {
  workoutLogId: number;
}

@Component({
  selector: 'app-add-workout-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatAutocompleteModule],
  templateUrl: './add-workout-item-dialog.html',
  styleUrl: './add-workout-item-dialog.scss',
})
export class AddWorkoutItemDialog implements OnInit {
  private fb = inject(FormBuilder);
  private workoutLogsService = inject(WorkoutLogs);
  private exercisesService = inject(Exercises);
  private dialogRef = inject(MatDialogRef<AddWorkoutItemDialog>);
  private destroyRef = inject(DestroyRef);
  data = inject<AddWorkoutItemDialogData>(MAT_DIALOG_DATA);

  searchResults: ExerciseDto[] = [];
  searching = false;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    exercise: [null as ExerciseDto | string | null, Validators.required],
    sets: [3, [Validators.required, Validators.min(1)]],
    reps: [10, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.form.controls.exercise.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const term = typeof value === 'string' ? value.trim() : '';
          if (term.length < 2) {
            this.searching = false;
            return of([] as ExerciseDto[]);
          }
          this.searching = true;
          return this.exercisesService.getAll({ name: term }).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searching = false;
        this.searchResults = results;
      });
  }

  get hasQuery(): boolean {
    const value = this.form.controls.exercise.value;
    return typeof value === 'string' && value.trim().length >= 2;
  }

  displayExercise = (item: ExerciseDto | string | null): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.exerciseName;
  };

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.form.controls.exercise.setValue(event.option.value);
    this.searchResults = [];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const exercise = this.form.controls.exercise.value;
    if (typeof exercise !== 'object' || exercise === null) {
      this.errorMessage = 'Please select an exercise from the list.';
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();

    this.workoutLogsService
      .addItem(this.data.workoutLogId, { exerciseId: exercise.id, sets: raw.sets!, reps: raw.reps! })
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
