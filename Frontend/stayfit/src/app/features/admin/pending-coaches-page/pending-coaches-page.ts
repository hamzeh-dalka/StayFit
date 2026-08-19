import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Users, UserDto } from '../../../core/services/users';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pending-coaches-page',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './pending-coaches-page.html',
  styleUrl: './pending-coaches-page.scss',
})
export class PendingCoachesPage implements OnInit {
  private usersService = inject(Users);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  coaches: UserDto[] = [];
  loading = true;

  ngOnInit(): void {
    this.loading = true;
    this.usersService.getPendingCoaches().subscribe({
      next: (coaches) => {
        this.coaches = coaches;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  approve(coach: UserDto): void {
    this.usersService.approveCoach(coach.id).subscribe({
      next: () => {
        this.removeCoach(coach.id);
        this.snackBar.open('Coach approved', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: (err) => {
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong approving that coach.';
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: 'app-snackbar' });
      },
    });
  }

  confirmReject(coach: UserDto): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '360px',
      panelClass: 'app-dialog-panel',
      data: {
        title: 'Reject coach',
        message: "Reject and permanently delete this coach's account? This cannot be undone.",
        confirmLabel: 'Reject',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.reject(coach);
    });
  }

  private reject(coach: UserDto): void {
    this.usersService.rejectCoach(coach.id).subscribe({
      next: () => {
        this.removeCoach(coach.id);
        this.snackBar.open('Coach rejected', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: (err) => {
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong rejecting that coach.';
        this.snackBar.open(message, 'Close', { duration: 4000, panelClass: 'app-snackbar' });
      },
    });
  }

  private removeCoach(id: number): void {
    this.coaches = this.coaches.filter((c) => c.id !== id);
  }
}
