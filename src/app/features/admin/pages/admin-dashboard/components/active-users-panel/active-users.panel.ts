import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { DashboardAnalyticsService, UserActivityData } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-active-users-panel',
  standalone: true,
  imports: [CommonModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './active-users.panel.html',
  styleUrls: ['./active-users.panel.scss'],
})
export class ActiveUsersPanelComponent implements OnInit {
  private analytics = inject(DashboardAnalyticsService);

  selectedPeriod = signal<'day' | 'week' | 'month'>('week');
  chartData: any = null;
  chartOptions: any = null;
  loading = signal(true);

  ngOnInit(): void {
    this.initChart();
    this.loadData();
  }

  selectPeriod(period: 'day' | 'week' | 'month'): void {
    this.selectedPeriod.set(period);
    this.loadData();
  }

  private initChart(): void {
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 17, 35, 0.9)',
          titleColor: '#f0f6fc',
          bodyColor: 'rgba(240, 246, 252, 0.7)',
          borderColor: 'rgba(102, 126, 234, 0.3)',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: 'rgba(240, 246, 252, 0.5)',
            font: { size: 11 },
          },
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          border: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        x: {
          ticks: {
            color: 'rgba(240, 246, 252, 0.5)',
            font: { size: 11 },
          },
          grid: { display: false },
          border: { color: 'rgba(255, 255, 255, 0.1)' },
        },
      },
    };
  }

  private loadData(): void {
    this.loading.set(true);
    const method =
      this.selectedPeriod() === 'day'
        ? 'getUserActivityDay'
        : this.selectedPeriod() === 'week'
          ? 'getUserActivityWeek'
          : 'getUserActivityMonth';

    (this.analytics[method as keyof DashboardAnalyticsService] as () => Observable<UserActivityData[]>)()
      .subscribe({
        next: (data: UserActivityData[]) => {
          this.updateChart(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private updateChart(data: UserActivityData[]): void {
    this.chartData = {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'Usuarios activos',
          data: data.map((d) => d.count),
          fill: true,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.12)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: 'rgba(15, 17, 35, 0.9)',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  }
}
