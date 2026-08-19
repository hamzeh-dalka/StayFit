import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  Dashboard,
  AdminDashboardDto,
  SystemDashboardDto,
} from '../../../core/services/dashboard';

@Component({
  selector: 'app-system-dashboard',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './system-dashboard.html',
  styleUrl: './system-dashboard.scss',
})
export class SystemDashboard implements OnInit {
  private dashboard = inject(Dashboard);

  adminStats: AdminDashboardDto | null = null;
  systemStats: SystemDashboardDto | null = null;
  loading = true;

  ngOnInit(): void {
    forkJoin({
      admin: this.dashboard.getAdmin(),
      system: this.dashboard.getSystem(),
    }).subscribe({
      next: ({ admin, system }) => {
        this.adminStats = admin;
        this.systemStats = system;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
