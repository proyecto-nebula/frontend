import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, StudioStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-top-studios-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './top-studios.panel.html',
  styleUrls: ['./studios.panel.scss'],
})
export class TopStudiosPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  studios = signal<StudioStats[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getTopStudios(10).subscribe({
      next: (data: StudioStats[]) => {
        this.studios.set(data.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
