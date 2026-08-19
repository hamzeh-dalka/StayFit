import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CoachClient, CoachClientDto } from '../../../core/services/coach-client';
import { CoachClientStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-my-clients',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './my-clients.html',
  styleUrl: './my-clients.scss',
})
export class MyClients implements OnInit {
  private coachClientService = inject(CoachClient);

  clients: CoachClientDto[] = [];
  loading = true;

  ngOnInit(): void {
    this.loading = true;
    this.coachClientService.getMyClients().subscribe({
      next: (clients) => {
        this.clients = clients.filter((c) => c.status === CoachClientStatus.Accepted);
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
}
