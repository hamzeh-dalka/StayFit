import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RegisterMenu } from '../../shared/components/register-menu/register-menu';
import { Logo } from '../../shared/components/logo/logo';
import { Dashboard, PublicStatsDto } from '../../core/services/dashboard';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, RegisterMenu, Logo],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  private dashboard = inject(Dashboard);

  animatedCoaches = 0;
  animatedWorkoutLogs = 0;
  animatedMeals = 0;

  ngOnInit(): void {
    this.dashboard.getPublicStats().subscribe((stats) => this.startCounters(stats));
  }

  private startCounters(stats: PublicStatsDto): void {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.animatedCoaches = stats.totalCoaches;
      this.animatedWorkoutLogs = stats.totalWorkoutLogs;
      this.animatedMeals = stats.totalMeals;
      return;
    }

    this.animateCounter(stats.totalCoaches, 1100, (value) => (this.animatedCoaches = value));
    this.animateCounter(stats.totalWorkoutLogs, 1300, (value) => (this.animatedWorkoutLogs = value));
    this.animateCounter(stats.totalMeals, 1500, (value) => (this.animatedMeals = value));
  }

  private animateCounter(target: number, duration: number, onUpdate: (value: number) => void): void {
    if (target <= 0) {
      onUpdate(target);
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      onUpdate(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}
