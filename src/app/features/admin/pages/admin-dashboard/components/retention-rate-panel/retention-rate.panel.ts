import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, RetentionStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-retention-rate-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './retention-rate.panel.html',
  styleUrls: ['./stats.panel.scss'],
})
export class RetentionRatePanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  stats = signal<RetentionStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getRetentionRate().subscribe({
      next: (data: RetentionStats) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
