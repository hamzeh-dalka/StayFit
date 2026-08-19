import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CoachProfiles, CoachProfileDto } from '../../../core/services/coach-profiles';
import { CoachDetailView } from '../../../shared/components/coach-detail-view/coach-detail-view';

@Component({
  selector: 'app-coach-browse-detail',
  standalone: true,
  imports: [CoachDetailView],
  templateUrl: './coach-browse-detail.html',
  styleUrl: './coach-browse-detail.scss',
})
export class CoachBrowseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private coachProfiles = inject(CoachProfiles);

  coach: CoachProfileDto | null = null;
  loading = true;
  notFound = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.coachProfiles.getById(id).subscribe({
      next: (coach) => {
        this.coach = coach;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }
}
