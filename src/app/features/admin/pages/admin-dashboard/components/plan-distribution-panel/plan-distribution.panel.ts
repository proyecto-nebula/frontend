import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, PlanStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-plan-distribution-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './plan-distribution.panel.html',
  styleUrls: ['./distribution.panel.scss'],
})
export class PlanDistributionPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  distribution = signal<PlanStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getPlanDistribution().subscribe({
      next: (data: PlanStats[]) => {
        this.distribution.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
