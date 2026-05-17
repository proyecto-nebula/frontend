import { Component, inject } from '@angular/core';
import { MaintenanceService } from '@services/maintenance.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  template: `
    <div class="maintenance-overlay">
      <div class="maintenance-body">
        <span class="maintenance-icon">🔧</span>
        <h1 class="maintenance-title">Estamos en mantenimiento</h1>
        <p class="maintenance-desc">Volvemos pronto. Gracias por tu paciencia.</p>
        <button class="btn" (click)="retry()">Reintentar</button>
      </div>
    </div>
  `,
})
export class MaintenancePage {
  private svc = inject(MaintenanceService);
  retry(): void { this.svc.check(); }
}
