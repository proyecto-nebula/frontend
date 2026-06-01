import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, PegiStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-pegi-distribution-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './pegi-distribution.panel.html',
  styleUrls: ['./distribution.panel.scss'],
})
export class PegiDistributionPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  distribution = signal<PegiStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getPegiDistribution().subscribe({
      next: (data: PegiStats[]) => {
        this.distribution.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
