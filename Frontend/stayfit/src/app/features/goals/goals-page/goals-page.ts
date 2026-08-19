import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Goals, GoalDto } from '../../../core/services/goals';
import { GoalType } from '../../../core/models/enums';
import { GoalDialog } from '../goal-dialog/goal-dialog';

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  [GoalType.WeightLoss]: 'Weight loss',
  [GoalType.MuscleGain]: 'Muscle gain',
  [GoalType.Maintenance]: 'Maintenance',
};

const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  [GoalType.WeightLoss]: 'monitor_weight',
  [GoalType.MuscleGain]: 'fitness_center',
  [GoalType.Maintenance]: 'balance',
};

@Component({
  selector: 'app-goals-page',
  standalone: true,
  imports: [DecimalPipe, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './goals-page.html',
  styleUrl: './goals-page.scss',
})
export class GoalsPage implements OnInit {
  private goalsService = inject(Goals);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  goals: GoalDto[] = [];
  loading = true;

  ngOnInit(): void {
    this.load();
  }

  goalTypeLabel(type: GoalType): string {
    return GOAL_TYPE_LABELS[type];
  }

  goalTypeIcon(type: GoalType): string {
    return GOAL_TYPE_ICONS[type];
  }

  progressPercent(goal: GoalDto): number {
    if (goal.targetValue <= 0) return 0;
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  }

  formatDeadline(deadline: string): string {
    const [year, month, day] = deadline.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(GoalDialog, { width: '420px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  openEditDialog(goal: GoalDto): void {
    const ref = this.dialog.open(GoalDialog, {
      width: '420px',
      panelClass: 'app-dialog-panel',
      data: { goal },
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  removeGoal(goal: GoalDto): void {
    this.goalsService.deleteById(goal.id).subscribe({
      next: () => {
        this.goals = this.goals.filter((g) => g.id !== goal.id);
        this.snackBar.open('Goal deleted', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: () => {
        this.snackBar.open('Something went wrong removing that goal.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.goalsService.getAll().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
