import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, SessionStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-session-stats-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './session-stats.panel.html',
  styleUrls: ['./stats.panel.scss'],
})
export class SessionStatsPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  stats = signal<SessionStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loading.set(true);
    this.analytics.getSessionStats().subscribe({
      next: (data: SessionStats) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatMinutes(mins: number): string {
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return hours > 0 ? `${hours}h ${remaining}m` : `${remaining}m`;
  }
}
