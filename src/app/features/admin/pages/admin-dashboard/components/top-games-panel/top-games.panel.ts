import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { DashboardAnalyticsService, GameStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-top-games-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './top-games.panel.html',
  styleUrls: ['./top-games.panel.scss'],
})
export class TopGamesPanelComponent implements OnInit {
  private analytics = inject(DashboardAnalyticsService);

  selectedPeriod = signal<'day' | 'week' | 'month'>('month');
  games = signal<GameStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadGames();
  }

  selectPeriod(period: 'day' | 'week' | 'month'): void {
    this.selectedPeriod.set(period);
    this.loadGames();
  }

  private loadGames(): void {
    this.loading.set(true);
    const method =
      this.selectedPeriod() === 'day'
        ? 'getTopGamesDay'
        : this.selectedPeriod() === 'week'
          ? 'getTopGamesWeek'
          : 'getTopGamesMonth';

    (this.analytics[method as keyof DashboardAnalyticsService] as () => Observable<GameStats[]>)()
      .subscribe({
        next: (data: GameStats[]) => {
          this.games.set(data.slice(0, 5));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}
