import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './pending-requests.html',
  styleUrl: './pending-requests.scss',
})
export class PendingRequests implements OnInit {
  private coachClientService = inject(CoachClient);

  requests: CoachClientDto[] = [];
  loading = true;

  ngOnInit(): void {
    this.loading = true;
    this.coachClientService.getMyClients().subscribe({
      next: (clients) => {
        this.requests = clients.filter((c) => c.status === CoachClientStatus.Pending);
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

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  accept(request: CoachClientDto): void {
    this.coachClientService.accept(request.id).subscribe({
      next: () => this.removeRequest(request.id),
    });
  }

  decline(request: CoachClientDto): void {
    this.coachClientService.reject(request.id).subscribe({
      next: () => this.removeRequest(request.id),
    });
  }

  private removeRequest(id: number): void {
    this.requests = this.requests.filter((r) => r.id !== id);
  }
}
