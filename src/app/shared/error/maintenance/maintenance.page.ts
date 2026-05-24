import { Component, inject } from '@angular/core';
import { MaintenanceService } from '@services/maintenance.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  templateUrl: './maintenance.page.html',
})
export class MaintenancePage {
  private svc = inject(MaintenanceService);
  retry(): void { this.svc.check(); }
}
