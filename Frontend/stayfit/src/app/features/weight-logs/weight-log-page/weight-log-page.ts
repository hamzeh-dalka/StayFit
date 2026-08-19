import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { WeightLogs, WeightLogDto } from '../../../core/services/weight-logs';
import { formatRelativeDate } from '../../../core/utils/format-relative-date';
import { buildSparkline, SparklineData } from '../../../core/utils/build-sparkline';
import { WeightLogDialog } from '../weight-log-dialog/weight-log-dialog';

type Period = '1M' | '3M' | 'All';

interface ChangeIndicator {
  diffLabel: string;
  direction: 'down' | 'up';
  periodLabel: string;
}

@Component({
  selector: 'app-weight-log-page',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './weight-log-page.html',
  styleUrl: './weight-log-page.scss',
})
export class WeightLogPage implements OnInit {
  private weightLogsService = inject(WeightLogs);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  entries: WeightLogDto[] = [];
  loading = true;
  period: Period = '1M';
  periods: Period[] = ['1M', '3M', 'All'];

  formatRelativeDate = formatRelativeDate;

  ngOnInit(): void {
    this.load();
  }

  selectPeriod(period: Period): void {
    this.period = period;
  }

  get filteredEntries(): WeightLogDto[] {
    if (this.period === 'All') return this.entries;

    const months = this.period === '1M' ? 1 : 3;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    return this.entries.filter((entry) => new Date(entry.recordedAt) >= cutoff);
  }

  get latestEntry(): WeightLogDto | null {
    return this.entries[0] ?? null;
  }

  get changeIndicator(): ChangeIndicator | null {
    const entries = this.filteredEntries;
    if (entries.length < 2) return null;

    const newest = entries[0].weightKg;
    const oldest = entries[entries.length - 1].weightKg;
    const diff = newest - oldest;
    if (diff === 0) return null;

    const periodLabel =
      this.period === '1M' ? 'this month' : this.period === '3M' ? 'these 3 months' : 'all time';

    return {
      diffLabel: Math.abs(diff).toFixed(1),
      direction: diff < 0 ? 'down' : 'up',
      periodLabel,
    };
  }

  get chart(): SparklineData | null {
    const points = [...this.filteredEntries].reverse();
    return buildSparkline(points.map((p) => p.weightKg));
  }

  openAddDialog(): void {
    const ref = this.dialog.open(WeightLogDialog, { width: '380px', panelClass: 'app-dialog-panel' });
    ref.afterClosed().subscribe((created) => {
      if (created) this.load();
    });
  }

  removeEntry(entry: WeightLogDto): void {
    this.weightLogsService.deleteById(entry.id).subscribe({
      next: () => {
        this.entries = this.entries.filter((e) => e.id !== entry.id);
        this.snackBar.open('Entry removed', 'Close', { duration: 3000, panelClass: 'app-snackbar' });
      },
      error: () => {
        this.snackBar.open('Something went wrong removing that entry.', 'Close', {
          duration: 3000,
          panelClass: 'app-snackbar',
        });
      },
    });
  }

  private load(): void {
    this.loading = true;
    this.weightLogsService.getAll({ pageSize: 500 }).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
