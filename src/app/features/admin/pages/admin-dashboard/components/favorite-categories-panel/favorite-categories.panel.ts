import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, CategoryStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-favorite-categories-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './favorite-categories.panel.html',
  styleUrls: ['./categories.panel.scss'],
})
export class FavoriteCategoriesPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  categories = signal<CategoryStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getTopFavoriteCategories(10).subscribe({
      next: (data: CategoryStats[]) => {
        this.categories.set(data.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
