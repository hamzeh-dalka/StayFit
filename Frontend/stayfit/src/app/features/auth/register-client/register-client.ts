import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth';
import { Gender } from '../../../core/models/enums';
import { RegisterClientRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register-client',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './register-client.html',
  styleUrl: './register-client.scss',
})
export class RegisterClient {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  genders = Object.values(Gender);

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    heightCm: [null as number | null, [Validators.required, Validators.min(1)]],
    dateOfBirth: ['', [Validators.required]],
    gender: [Gender.Male, [Validators.required]],
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

    const request = this.form.getRawValue() as RegisterClientRequest;

    this.authService.registerClient(request).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Account created! You can now log in.', 'Close', {
          duration: 4000,
          panelClass: 'app-snackbar',
        });
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Something went wrong while creating your account. Please try again.';
      },
    });
  }
}
