import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth';
import { Role } from '../../../core/models/enums';
import { RegisterMenu } from '../../../shared/components/register-menu/register-menu';

const DASHBOARD_PATH_BY_ROLE: Record<Role, string> = {
  [Role.Client]: '/dashboard/client',
  [Role.Coach]: '/dashboard/coach',
  [Role.Admin]: '/dashboard/admin',
  [Role.SuperAdmin]: '/dashboard/system',
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule, RegisterMenu],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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

    this.authService.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Welcome back!', 'Close', { duration: 3000, panelClass: 'app-snackbar' });

        const role = this.authService.currentRole();
        const redirectPath = role ? DASHBOARD_PATH_BY_ROLE[role] : '/';
        this.router.navigateByUrl(redirectPath);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage =
          typeof err?.error === 'string' ? err.error : 'Invalid email or password. Please try again.';
      },
    });
  }
}
