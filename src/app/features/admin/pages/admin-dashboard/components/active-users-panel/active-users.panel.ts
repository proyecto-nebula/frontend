import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserActivityData } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-active-users-panel',
  standalone: true,
  imports: [CommonModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './active-users.panel.html',
  styleUrls: ['./active-users.panel.scss'],
})
export class ActiveUsersPanelComponent implements OnInit {

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
    this.updateChart(this.getMockData(this.selectedPeriod()));
    this.loading.set(false);
  }

  private getMockData(period: 'day' | 'week' | 'month'): UserActivityData[] {
    if (period === 'day') {
      return [
        { date: '00:00', count: 3 },  { date: '01:00', count: 2 },  { date: '02:00', count: 1 },
        { date: '03:00', count: 1 },  { date: '04:00', count: 2 },  { date: '05:00', count: 5 },
        { date: '06:00', count: 9 },  { date: '07:00', count: 14 }, { date: '08:00', count: 19 },
        { date: '09:00', count: 24 }, { date: '10:00', count: 29 }, { date: '11:00', count: 33 },
        { date: '12:00', count: 30 }, { date: '13:00', count: 36 }, { date: '14:00', count: 40 },
        { date: '15:00', count: 44 }, { date: '16:00', count: 47 }, { date: '17:00', count: 51 },
        { date: '18:00', count: 55 }, { date: '19:00', count: 50 }, { date: '20:00', count: 45 },
        { date: '21:00', count: 39 }, { date: '22:00', count: 29 }, { date: '23:00', count: 16 },
      ];
    }
    if (period === 'week') {
      return [
        { date: 'Lun', count: 38 }, { date: 'Mar', count: 45 }, { date: 'Mié', count: 52 },
        { date: 'Jue', count: 47 }, { date: 'Vie', count: 63 }, { date: 'Sáb', count: 76 },
        { date: 'Dom', count: 57 },
      ];
    }
    return [
      { date: '03/05', count: 22 }, { date: '04/05', count: 19 }, { date: '05/05', count: 31 },
      { date: '06/05', count: 28 }, { date: '07/05', count: 36 }, { date: '08/05', count: 43 },
      { date: '09/05', count: 39 }, { date: '10/05', count: 46 }, { date: '11/05', count: 53 },
      { date: '12/05', count: 49 }, { date: '13/05', count: 57 }, { date: '14/05', count: 62 },
      { date: '15/05', count: 59 }, { date: '16/05', count: 65 }, { date: '17/05', count: 71 },
      { date: '18/05', count: 68 }, { date: '19/05', count: 75 }, { date: '20/05', count: 69 },
      { date: '21/05', count: 73 }, { date: '22/05', count: 80 }, { date: '23/05', count: 86 },
      { date: '24/05', count: 82 }, { date: '25/05', count: 89 }, { date: '26/05', count: 94 },
      { date: '27/05', count: 87 }, { date: '28/05', count: 95 }, { date: '29/05', count: 99 },
      { date: '30/05', count: 92 }, { date: '31/05', count: 97 }, { date: '01/06', count: 106 },
    ];
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
