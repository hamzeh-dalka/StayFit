import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth';
import { SidebarState } from '../../../core/services/sidebar-state';
import { Role } from '../../../core/models/enums';
import { Logo } from '../logo/logo';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/client' },
  { label: 'Meals', icon: 'restaurant', path: '/meals' },
  { label: 'Workouts', icon: 'fitness_center', path: '/workout-logs' },
  { label: 'Weight log', icon: 'monitor_weight', path: '/weight-logs' },
  { label: 'Goals', icon: 'flag', path: '/goals' },
  { label: 'Plans', icon: 'assignment', path: '/plans' },
  { label: 'My coaches', icon: 'groups', path: '/my-coaches' },
  { label: 'Messages', icon: 'chat', path: '/messages' },
];

const COACH_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/coach' },
  { label: 'My clients', icon: 'groups', path: '/my-clients' },
  { label: 'Pending requests', icon: 'pending_actions', path: '/pending-requests' },
  { label: 'Nutrition plans', icon: 'restaurant_menu', path: '/nutrition-plans' },
  { label: 'Workout plans', icon: 'assignment', path: '/workout-plans' },
  { label: 'Messages', icon: 'chat', path: '/messages' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/admin' },
  { label: 'Pending coaches', icon: 'pending_actions', path: '/admin/pending-coaches' },
  { label: 'Food items', icon: 'restaurant_menu', path: '/food-items' },
  { label: 'Exercises', icon: 'fitness_center', path: '/exercises' },
];

const SUPER_ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/system' },
  { label: 'Users', icon: 'group', path: '/admin/users' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, Logo],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);
  private sidebarState = inject(SidebarState);

  collapsed = this.sidebarState.collapsed;
  currentUser = this.authService.currentUser;

  navItems = computed<NavItem[]>(() => {
    switch (this.authService.currentRole()) {
      case Role.Client:
        return CLIENT_NAV;
      case Role.Coach:
        return COACH_NAV;
      case Role.Admin:
        return ADMIN_NAV;
      case Role.SuperAdmin:
        return SUPER_ADMIN_NAV;
      default:
        return [];
    }
  });

  toggle(): void {
    this.sidebarState.toggle();
  }

  logout(): void {
    this.authService.logout();
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
}
