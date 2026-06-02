import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserActivityData } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-new-users-panel',
  standalone: true,
  imports: [CommonModule, ChartModule, ProgressSpinnerModule],
  templateUrl: './new-users.panel.html',
  styleUrls: ['./new-users.panel.scss'],
})
export class NewUsersPanelComponent implements OnInit {

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
    const data = this.getMockData(this.selectedPeriod());
    this.totalNew.set(data.reduce((sum, d) => sum + d.count, 0));
    this.updateChart(data);
    this.loading.set(false);
  }

  private getMockData(period: 'day' | 'week' | 'month'): UserActivityData[] {
    if (period === 'day') {
      return [
        { date: '00:00', count: 0 }, { date: '01:00', count: 0 }, { date: '02:00', count: 0 },
        { date: '03:00', count: 1 }, { date: '04:00', count: 0 }, { date: '05:00', count: 0 },
        { date: '06:00', count: 1 }, { date: '07:00', count: 2 }, { date: '08:00', count: 3 },
        { date: '09:00', count: 2 }, { date: '10:00', count: 4 }, { date: '11:00', count: 3 },
        { date: '12:00', count: 5 }, { date: '13:00', count: 4 }, { date: '14:00', count: 3 },
        { date: '15:00', count: 5 }, { date: '16:00', count: 6 }, { date: '17:00', count: 7 },
        { date: '18:00', count: 8 }, { date: '19:00', count: 6 }, { date: '20:00', count: 5 },
        { date: '21:00', count: 4 }, { date: '22:00', count: 2 }, { date: '23:00', count: 1 },
      ];
    }
    if (period === 'week') {
      return [
        { date: 'Lun', count: 8 },  { date: 'Mar', count: 12 }, { date: 'Mié', count: 9 },
        { date: 'Jue', count: 15 }, { date: 'Vie', count: 21 }, { date: 'Sáb', count: 28 },
        { date: 'Dom', count: 14 },
      ];
    }
    return [
      { date: '03/05', count: 3 }, { date: '04/05', count: 5 }, { date: '05/05', count: 4 },
      { date: '06/05', count: 6 }, { date: '07/05', count: 4 }, { date: '08/05', count: 7 },
      { date: '09/05', count: 5 }, { date: '10/05', count: 8 }, { date: '11/05', count: 6 },
      { date: '12/05', count: 9 }, { date: '13/05', count: 7 }, { date: '14/05', count: 10 },
      { date: '15/05', count: 8 }, { date: '16/05', count: 12 }, { date: '17/05', count: 10 },
      { date: '18/05', count: 11 }, { date: '19/05', count: 13 }, { date: '20/05', count: 9 },
      { date: '21/05', count: 14 }, { date: '22/05', count: 12 }, { date: '23/05', count: 16 },
      { date: '24/05', count: 13 }, { date: '25/05', count: 18 }, { date: '26/05', count: 15 },
      { date: '27/05', count: 17 }, { date: '28/05', count: 21 }, { date: '29/05', count: 19 },
      { date: '30/05', count: 22 }, { date: '31/05', count: 18 }, { date: '01/06', count: 24 },
    ];
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
