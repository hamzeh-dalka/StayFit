import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CoachProfileDto } from '../../../core/services/coach-profiles';
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
  selector: 'app-coach-detail-view',
  standalone: true,
  imports: [RouterLink, MatProgressSpinnerModule],
  templateUrl: './coach-detail-view.html',
  styleUrl: './coach-detail-view.scss',
})
export class CoachDetailView {
  @Input() coach: CoachProfileDto | null = null;
  @Input() loading = false;
  @Input() notFound = false;
  @Input() backLink = '/coaches';

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
}
