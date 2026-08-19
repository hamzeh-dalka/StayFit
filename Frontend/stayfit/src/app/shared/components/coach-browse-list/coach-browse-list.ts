import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CoachProfiles, CoachProfileDto } from '../../../core/services/coach-profiles';
import { CoachClient } from '../../../core/services/coach-client';
import { Specialty } from '../../../core/models/enums';

const SPECIALTY_LABELS: Record<Specialty, string> = {
  [Specialty.Nutrition]: 'Nutrition',
  [Specialty.WeightLoss]: 'Weight loss',
  [Specialty.MuscleGain]: 'Muscle gain',
  [Specialty.StrengthTraining]: 'Strength training',
  [Specialty.Cardio]: 'Cardio',
  [Specialty.Rehabilitation]: 'Rehabilitation',
  [Specialty.GeneralFitness]: 'General fitness',
  [Specialty.SportsPerformance]: 'Sports performance',
};

@Component({
  selector: 'app-coach-browse-list',
  standalone: true,
  imports: [RouterLink, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './coach-browse-list.html',
  styleUrl: './coach-browse-list.scss',
})
export class CoachBrowseList implements OnInit {
  @Input() showRequestAction = false;

  private coachProfiles = inject(CoachProfiles);
  private coachClient = inject(CoachClient);
  private snackBar = inject(MatSnackBar);

  specialties = Object.values(Specialty);
  activeSpecialty: Specialty | null = null;
  coaches: CoachProfileDto[] = [];
  loading = true;
  requestedCoachIds = new Set<number>();
  pendingRequestIds = new Set<number>();

  ngOnInit(): void {
    this.loadCoaches();
  }

  selectSpecialty(specialty: Specialty | null): void {
    if (this.activeSpecialty === specialty) return;
    this.activeSpecialty = specialty;
    this.loadCoaches();
  }

  specialtyLabel(specialty: Specialty): string {
    return SPECIALTY_LABELS[specialty];
  }

  initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }

  requestCoach(coach: CoachProfileDto): void {
    if (this.requestedCoachIds.has(coach.id) || this.pendingRequestIds.has(coach.id)) return;

    this.pendingRequestIds.add(coach.id);
    this.coachClient.requestCoach(coach.id).subscribe({
      next: () => {
        this.pendingRequestIds.delete(coach.id);
        this.requestedCoachIds.add(coach.id);
        this.snackBar.open('Request sent', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: (err) => {
        this.pendingRequestIds.delete(coach.id);
        const message =
          typeof err?.error === 'string' ? err.error : 'Something went wrong sending that request.';
        this.snackBar.open(message, 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
    });
  }

  private loadCoaches(): void {
    this.loading = true;
    const filter = this.activeSpecialty ? { specialty: this.activeSpecialty } : {};

    this.coachProfiles.getAll(filter).subscribe({
      next: (coaches) => {
        this.coaches = coaches;
        this.loading = false;
      },
      error: () => {
        this.coaches = [];
        this.loading = false;
      },
    });
  }
}
