import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Exercises, ExerciseDto, SaveExerciseDto } from '../../../core/services/exercises';

export interface ExerciseDialogData {
  exercise?: ExerciseDto;
}

@Component({
  selector: 'app-exercise-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './exercise-dialog.html',
  styleUrl: './exercise-dialog.scss',
})
export class ExerciseDialog {
  private fb = inject(FormBuilder);
  private exercisesService = inject(Exercises);
  private dialogRef = inject(MatDialogRef<ExerciseDialog>);
  data = inject<ExerciseDialogData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = !!this.data.exercise;

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    exerciseName: [this.data.exercise?.exerciseName ?? '', Validators.required],
    muscleGroup: [this.data.exercise?.muscleGroup ?? '', Validators.required],
    caloriesBurnedPerMinute: [
      this.data.exercise?.caloriesBurnedPerMinute ?? null,
      [Validators.required, Validators.min(0)],
    ],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const dto: SaveExerciseDto = {
      exerciseName: raw.exerciseName!,
      muscleGroup: raw.muscleGroup!,
      caloriesBurnedPerMinute: raw.caloriesBurnedPerMinute!,
    };

    const request = this.isEdit
      ? this.exercisesService.update(this.data.exercise!.id, dto)
      : this.exercisesService.create(dto);

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
