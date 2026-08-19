import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth';
import { Dashboard, CoachDashboardDto } from '../../../core/services/dashboard';
import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './coach-dashboard.html',
  styleUrl: './coach-dashboard.scss',
})
export class CoachDashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboard = inject(Dashboard);
  private coachClientService = inject(CoachClient);

  currentUser = this.authService.currentUser;

  stats: CoachDashboardDto | null = null;
  pendingRequests: CoachClientDto[] = [];
  loading = true;

  ngOnInit(): void {
    forkJoin({
      stats: this.dashboard.getCoach(),
      clients: this.coachClientService.getMyClients(),
    }).subscribe({
      next: ({ stats, clients }) => {
        this.stats = stats;
        this.pendingRequests = clients.filter((c) => c.status === CoachClientStatus.Pending);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get visiblePendingRequests(): CoachClientDto[] {
    return this.pendingRequests.slice(0, 5);
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  accept(request: CoachClientDto): void {
    this.coachClientService.accept(request.id).subscribe({
      next: () => this.removePendingRequest(request.id),
    });
  }

  decline(request: CoachClientDto): void {
    this.coachClientService.reject(request.id).subscribe({
      next: () => this.removePendingRequest(request.id),
    });
  }

  private removePendingRequest(id: number): void {
    this.pendingRequests = this.pendingRequests.filter((r) => r.id !== id);
    if (this.stats) {
      this.stats = { ...this.stats, pendingRequests: Math.max(0, this.stats.pendingRequests - 1) };
    }
  }
}
