import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CoachProfiles, CoachProfileDto } from '../../../core/services/coach-profiles';
import { RegisterMenu } from '../../../shared/components/register-menu/register-menu';
import { Logo } from '../../../shared/components/logo/logo';
import { CoachDetailView } from '../../../shared/components/coach-detail-view/coach-detail-view';

@Component({
  selector: 'app-coach-detail',
  standalone: true,
  imports: [RouterLink, RegisterMenu, Logo, CoachDetailView],
  templateUrl: './coach-detail.html',
  styleUrl: './coach-detail.scss',
})
export class CoachDetail implements OnInit {
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
