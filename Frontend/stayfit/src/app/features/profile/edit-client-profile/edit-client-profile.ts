import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClientProfiles, SaveClientProfileDto } from '../../../core/services/client-profiles';
import { Gender } from '../../../core/models/enums';

@Component({
  selector: 'app-edit-client-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule, MatProgressSpinnerModule],
  templateUrl: './edit-client-profile.html',
  styleUrl: './edit-client-profile.scss',
})
export class EditClientProfile implements OnInit {
  private fb = inject(FormBuilder);
  private clientProfiles = inject(ClientProfiles);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  genders = Object.values(Gender);

  loading = true;
  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    heightCm: [null as number | null, [Validators.required, Validators.min(1)]],
    dateOfBirth: ['', [Validators.required]],
    gender: [Gender.Male, [Validators.required]],
  });

  ngOnInit(): void {
    this.clientProfiles.getMe().subscribe({
      next: (profile) => {
        this.form.patchValue({
          heightCm: profile.heightCm,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
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

    const dto = this.form.getRawValue() as SaveClientProfileDto;

    this.clientProfiles.updateMe(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Profile updated', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
        this.router.navigateByUrl('/dashboard/client');
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Something went wrong saving your profile. Please try again.';
      },
    });
  }
}
