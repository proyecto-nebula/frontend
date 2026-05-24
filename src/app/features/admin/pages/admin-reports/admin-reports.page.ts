import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { API_ROUTES } from '@config/api.routes';
import { Report } from '@models/report.model';
import { ToastService } from '@ui/toast/toast.service';
import { ReportsBadgeService } from '@services/reports-badge.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink, TableModule, ToggleSwitch],
  templateUrl: './admin-reports.page.html',
})
export class AdminReportsPage implements OnInit {
  private http     = inject(HttpClient);
  private route    = inject(ActivatedRoute);
  private router   = inject(Router);
  private toast    = inject(ToastService);
  private badge    = inject(ReportsBadgeService);

  items       = signal<Report[]>([]);
  viewMode    = signal<'list' | 'form'>('list');
  editingItem = signal<Report | null>(null);
  solved      = false;

  readonly typeLabels: Record<number, string> = {
    1: 'No carga',
    2: 'Error gráfico',
    3: 'Problema de audio',
    4: 'Otro',
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.http.get<Report>(`${API_ROUTES.reports}?id=${id}`).subscribe(item => {
          if (item) {
            this.editingItem.set(item);
            this.solved = !!item.isSolved;
            this.viewMode.set('form');
          }
        });
      } else {
        this.editingItem.set(null);
        this.viewMode.set('list');
        this.loadList();
      }
    });
  }

  loadList(): void {
    this.http.get<Report[]>(API_ROUTES.reports).subscribe(data => {
      const list = data ?? [];
      this.items.set(list);
      this.badge.set(list.filter(r => !r.isSolved).length);
    });
  }

  goEdit(id: number): void { this.router.navigate(['/admin/reports', id]); }
  cancel():           void { this.router.navigate(['/admin/reports']); }

  remove(id: number): void {
    if (!confirm('¿Eliminar este reporte?')) return;
    this.http.delete(`${API_ROUTES.reports}?id=${id}`).subscribe({
      next: () => { this.toast.success('Reporte eliminado'); this.loadList(); },
      error: () => this.toast.error('Error al eliminar'),
    });
  }

  toggleSolved(id: number, value: boolean): void {
    this.http.patch(`${API_ROUTES.reports}?id=${id}`, { isSolved: value ? 1 : 0 }).subscribe({
      next: () => {
        this.items.update(list =>
          list.map(r => Number(r.id) === id ? { ...r, isSolved: value } : r)
        );
        value ? this.badge.decrement() : this.badge.increment();
        this.toast.success('Reporte actualizado');
      },
      error: () => this.toast.error('Error al actualizar'),
    });
  }

  save(): void {
    const item = this.editingItem();
    if (!item) return;
    const wasSolved = !!item.isSolved;
    this.http.patch(`${API_ROUTES.reports}?id=${item.id}`, { isSolved: this.solved ? 1 : 0 }).subscribe({
      next: () => {
        if (this.solved && !wasSolved) this.badge.decrement();
        else if (!this.solved && wasSolved) this.badge.increment();
        this.toast.success('Guardado');
        this.router.navigate(['/admin/reports']);
      },
      error: () => this.toast.error('Error al guardar'),
    });
  }

  typeLabel(type: number): string { return this.typeLabels[type] ?? 'Desconocido'; }
}
