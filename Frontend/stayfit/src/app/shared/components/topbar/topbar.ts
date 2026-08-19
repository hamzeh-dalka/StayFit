import { Component, computed, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth';
import { Notifications, NotificationDto } from '../../../core/services/notifications';
import { Role } from '../../../core/models/enums';
import { formatRelativeDate } from '../../../core/utils/format-relative-date';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationsService = inject(Notifications);
  private elementRef = inject(ElementRef<HTMLElement>);

  currentUser = this.authService.currentUser;
  pageTitle = signal(this.leafTitle());
  isOpen = signal(false);

  notifications = signal<NotificationDto[]>([]);
  unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  isNotifOpen = signal(false);
  formatRelativeDate = formatRelativeDate;

  editProfilePath = computed(() => {
    switch (this.authService.currentRole()) {
      case Role.Client:
        return '/profile/edit-client';
      case Role.Coach:
        return '/profile/edit-coach';
      default:
        return null;
    }
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.pageTitle.set(this.leafTitle()));
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  toggleMenu(): void {
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) this.isNotifOpen.set(false);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  logout(): void {
    this.isOpen.set(false);
    this.authService.logout();
  }

  toggleNotifications(): void {
    const opening = !this.isNotifOpen();
    this.isNotifOpen.set(opening);
    if (opening) {
      this.isOpen.set(false);
      this.loadNotifications();
    }
  }

  markAsRead(notification: NotificationDto): void {
    if (notification.isRead) return;

    this.notificationsService.markAsRead(notification.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
      );
    });
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
      this.isNotifOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
    this.isNotifOpen.set(false);
  }

  private loadNotifications(): void {
    this.notificationsService.getAll().subscribe({
      next: (notifications) => this.notifications.set(notifications),
      error: () => undefined,
    });
  }

  private leafTitle(): string {
    let route: ActivatedRoute | undefined = this.route.root;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return (route?.snapshot?.data?.['title'] as string) ?? 'StayFit';
  }
}
