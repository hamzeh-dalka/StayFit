import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-my-coaches',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './my-coaches.html',
  styleUrl: './my-coaches.scss',
})
export class MyCoaches implements OnInit {
  private coachClientService = inject(CoachClient);
  private snackBar = inject(MatSnackBar);

  coaches: CoachClientDto[] = [];
  loading = true;

  ngOnInit(): void {
    this.load();
  }

  get activeCoaches(): CoachClientDto[] {
    return this.coaches.filter((c) => c.status === CoachClientStatus.Accepted);
  }

  get pendingCoaches(): CoachClientDto[] {
    return this.coaches.filter((c) => c.status === CoachClientStatus.Pending);
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  cancelRequest(coach: CoachClientDto): void {
    this.coachClientService.endRelation(coach.id).subscribe({
      next: () => {
        this.coaches = this.coaches.filter((c) => c.id !== coach.id);
        this.snackBar.open('Request canceled', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: () => {
        this.snackBar.open('Something went wrong canceling that request.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.coachClientService.getMyCoaches().subscribe({
      next: (coaches) => {
        this.coaches = coaches;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
