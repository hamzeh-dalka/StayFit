import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth';
import { Specialty } from '../../../core/models/enums';
import { RegisterCoachRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register-coach',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './register-coach.html',
  styleUrl: './register-coach.scss',
})
export class RegisterCoach {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  specialties = Object.values(Specialty);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    specialty: [Specialty.GeneralFitness, [Validators.required]],
    bio: [''],
    experienceYears: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  submitting = false;
  errorMessage: string | null = null;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();
    const request: RegisterCoachRequest = {
      ...raw,
      bio: raw.bio || undefined,
    } as RegisterCoachRequest;

    this.authService.registerCoach(request).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open(
          "Your account is pending review. You'll be able to log in once an admin approves it.",
          'Close',
          {
            duration: 4000,
            panelClass: 'app-snackbar',
          },
        );
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Something went wrong while creating your account. Please try again.';
      },
    });
  }
}
