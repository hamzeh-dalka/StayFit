import { Component, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Dashboard, AdminDashboardDto } from '../../../core/services/dashboard';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private dashboard = inject(Dashboard);

  adminStats: AdminDashboardDto | null = null;
  loading = true;

  ngOnInit(): void {
    this.dashboard.getAdmin().subscribe({
      next: (admin) => {
        this.adminStats = admin;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
