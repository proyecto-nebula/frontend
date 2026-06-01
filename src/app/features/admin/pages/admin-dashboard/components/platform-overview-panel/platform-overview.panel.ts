import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, PlatformOverview } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-platform-overview-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './platform-overview.panel.html',
  styleUrls: ['./platform-overview.panel.scss'],
})
export class PlatformOverviewPanelComponent implements OnInit {
  private analytics = inject(DashboardAnalyticsService);

  overview = signal<PlatformOverview | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.analytics.getPlatformOverview().subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
