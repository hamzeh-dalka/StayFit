import { Component } from '@angular/core';

import { CoachBrowseList } from '../../../shared/components/coach-browse-list/coach-browse-list';

@Component({
  selector: 'app-coaches-browse',
  standalone: true,
  imports: [CoachBrowseList],
  templateUrl: './coaches-browse.html',
  styleUrl: './coaches-browse.scss',
})
export class CoachesBrowse {}
