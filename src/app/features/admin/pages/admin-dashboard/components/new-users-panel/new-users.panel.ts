import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { DashboardAnalyticsService, UserActivityData } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-new-users-panel',
  standalone: true,
  imports: [CommonModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './new-users.panel.html',
  styleUrls: ['./new-users.panel.scss'],
})
export class NewUsersPanelComponent implements OnInit {
  private analytics = inject(DashboardAnalyticsService);

  selectedPeriod = signal<'day' | 'week' | 'month'>('month');
  chartData: any = null;
  chartOptions: any = null;
  loading = signal(true);
  totalNew = signal(0);

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
          borderColor: 'rgba(52, 211, 153, 0.3)',
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
        ? 'getNewUsersDay'
        : this.selectedPeriod() === 'week'
          ? 'getNewUsersWeek'
          : 'getNewUsersMonth';

    (this.analytics[method as keyof DashboardAnalyticsService] as () => Observable<UserActivityData[]>)()
      .subscribe({
        next: (data: UserActivityData[]) => {
          this.totalNew.set(data.reduce((sum, d) => sum + d.count, 0));
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
          label: 'Nuevos usuarios',
          data: data.map((d) => d.count),
          fill: true,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#34d399',
          pointBorderColor: 'rgba(15, 17, 35, 0.9)',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  }
}
