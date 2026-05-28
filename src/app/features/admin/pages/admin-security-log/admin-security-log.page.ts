import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { ToastService } from '@ui/toast/toast.service';
import { TableModule } from 'primeng/table';

interface LogEntry {
  timestamp: string;
  event: string;
  ip: string;
  ua?: string;
  email?: string;
  user_id?: number | string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-admin-security-log',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './admin-security-log.page.html',
})
export class AdminSecurityLogPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  entries = signal<LogEntry[]>([]);
  loading = signal(false);
  clearing = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get<LogEntry[]>(API_ROUTES.logs).subscribe({
      next: data => {
        this.entries.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.show('error', 'Error al cargar el log de seguridad');
        this.loading.set(false);
      },
    });
  }

  clearLog(): void {
    if (!confirm('¿Seguro que quieres limpiar todo el log de seguridad?')) return;
    this.clearing.set(true);
    this.http.delete(API_ROUTES.logs).subscribe({
      next: () => {
        this.entries.set([]);
        this.clearing.set(false);
        this.toast.show('success', 'Log limpiado correctamente');
      },
      error: () => {
        this.toast.show('error', 'Error al limpiar el log');
        this.clearing.set(false);
      },
    });
  }

  /** Devuelve los campos extra de una entrada (sin los campos base). */
  extraContext(entry: LogEntry): string {
    const base = new Set(['timestamp', 'event', 'ip', 'ua']);
    const extra = Object.entries(entry)
      .filter(([k]) => !base.has(k))
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    return extra || '—';
  }

  eventClass(event: string): string {
    if (event.includes('SUCCESS')) return 'log-success';
    if (event.includes('FAILURE') || event.includes('INVALID')) return 'log-danger';
    if (event.includes('BLOCK') || event.includes('LIMIT')) return 'log-warn';
    return '';
  }
}
