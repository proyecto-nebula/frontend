import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, GameStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-favorite-games-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './favorite-games.panel.html',
  styleUrls: ['./favorite-games.panel.scss'],
})
export class FavoriteGamesPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  games = signal<GameStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadGames();
  }

  private loadGames(): void {
    this.loading.set(true);
    this.analytics.getTopFavoriteGames(5).subscribe({
      next: (data: GameStats[]) => {
        this.games.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
