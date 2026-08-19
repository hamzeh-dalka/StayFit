import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { WorkoutPlans } from '../../../core/services/workout-plans';
import { Exercises, ExerciseDto } from '../../../core/services/exercises';
import { dayOfWeekLabel } from '../../../core/utils/day-of-week-label';

export interface AddPlanExerciseItemDialogData {
  planId: number;
}

const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

@Component({
  selector: 'app-add-plan-exercise-item-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatAutocompleteModule],
  templateUrl: './add-plan-exercise-item-dialog.html',
  styleUrl: './add-plan-exercise-item-dialog.scss',
})
export class AddPlanExerciseItemDialog implements OnInit {
  private fb = inject(FormBuilder);
  private workoutPlansService = inject(WorkoutPlans);
  private exercisesService = inject(Exercises);
  private dialogRef = inject(MatDialogRef<AddPlanExerciseItemDialog>);
  private destroyRef = inject(DestroyRef);
  data = inject<AddPlanExerciseItemDialogData>(MAT_DIALOG_DATA);

  days = DAYS_OF_WEEK;
  dayLabel = dayOfWeekLabel;

  searchResults: ExerciseDto[] = [];
  searching = false;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    exercise: [null as ExerciseDto | string | null, Validators.required],
    sets: [3, [Validators.required, Validators.min(1)]],
    reps: [10, [Validators.required, Validators.min(1)]],
    dayOfWeek: [new Date().getDay(), Validators.required],
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

    this.workoutPlansService
      .addItem(this.data.planId, {
        exerciseId: exercise.id,
        sets: raw.sets!,
        reps: raw.reps!,
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
