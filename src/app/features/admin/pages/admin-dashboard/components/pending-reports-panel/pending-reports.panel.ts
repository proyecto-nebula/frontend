import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DashboardAnalyticsService, ReportStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-pending-reports-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './pending-reports.panel.html',
  styleUrls: ['./pending-reports.panel.scss'],
})
export class PendingReportsPanelComponent implements OnInit {
  private analytics: DashboardAnalyticsService = inject(DashboardAnalyticsService);

  stats = signal<ReportStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.analytics.getReportStats().subscribe({
      next: (data: ReportStats) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getReportTypeLabel(type: number): string {
    const labels: Record<number, string> = {
      1: 'Bug',
      2: 'Sugerencia',
      3: 'Contenido',
      4: 'Otro',
    };
    return labels[type] || `Tipo ${type}`;
  }

  getReportTypeColor(type: number): string {
    const colors: Record<number, string> = {
      1: '#ef4444',
      2: '#3b82f6',
      3: '#f59e0b',
      4: '#8b5cf6',
    };
    return colors[type] || '#6b7280';
  }
}
