import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, CategoryStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-top-categories-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './top-categories.panel.html',
  styleUrls: ['./categories.panel.scss'],
})
export class TopCategoriesPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  categories = signal<CategoryStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getTopCategories(10).subscribe({
      next: (data: CategoryStats[]) => {
        this.categories.set(data.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatHours(minutes?: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}
