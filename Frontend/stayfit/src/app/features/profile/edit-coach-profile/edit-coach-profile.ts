import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CoachProfiles, SaveCoachProfileDto } from '../../../core/services/coach-profiles';
import { Specialty } from '../../../core/models/enums';

@Component({
  selector: 'app-edit-coach-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './edit-coach-profile.html',
  styleUrl: './edit-coach-profile.scss',
})
export class EditCoachProfile implements OnInit {
  private fb = inject(FormBuilder);
  private coachProfiles = inject(CoachProfiles);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  specialties = Object.values(Specialty);

  loading = true;
  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    specialty: [Specialty.GeneralFitness, [Validators.required]],
    bio: [''],
    experienceYears: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.coachProfiles.getMe().subscribe({
      next: (profile) => {
        this.form.patchValue({
          specialty: profile.specialty,
          bio: profile.bio,
          experienceYears: profile.experienceYears,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not load your profile. Please try again.';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const dto = this.form.getRawValue() as SaveCoachProfileDto;

    this.coachProfiles.updateMe(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Profile updated', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
        this.router.navigateByUrl('/dashboard/coach');
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Something went wrong saving your profile. Please try again.';
      },
    });
  }
}
