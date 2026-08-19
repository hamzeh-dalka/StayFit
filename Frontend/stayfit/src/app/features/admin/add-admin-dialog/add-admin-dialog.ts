import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-add-admin-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './add-admin-dialog.html',
  styleUrl: './add-admin-dialog.scss',
})
export class AddAdminDialog {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<AddAdminDialog>);
  private snackBar = inject(MatSnackBar);

  submitting = false;
  errorMessage: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    const raw = this.form.getRawValue();

    this.authService.registerAdmin({ name: raw.name!, email: raw.email!, password: raw.password! }).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Admin account created', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
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
