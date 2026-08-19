import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RegisterMenu } from '../../../shared/components/register-menu/register-menu';
import { Logo } from '../../../shared/components/logo/logo';
import { CoachBrowseList } from '../../../shared/components/coach-browse-list/coach-browse-list';

@Component({
  selector: 'app-coach-directory',
  standalone: true,
  imports: [RouterLink, RegisterMenu, Logo, CoachBrowseList],
  templateUrl: './coach-directory.html',
  styleUrl: './coach-directory.scss',
})
export class CoachDirectory {}
