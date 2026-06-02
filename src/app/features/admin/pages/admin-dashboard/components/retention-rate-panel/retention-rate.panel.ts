import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RetentionStats } from '../../../../services/dashboard-analytics.service';

@Component({
  selector: 'app-retention-rate-panel',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './retention-rate.panel.html',
  styleUrls: ['./stats.panel.scss'],
})
export class RetentionRatePanelComponent implements OnInit {
  stats = signal<RetentionStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.stats.set({ week1: 42, week2: 38 });
    this.loading.set(false);
  }
}
