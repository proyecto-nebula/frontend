import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DebugPanelUi } from '@ui/auth-status.ui';
import { AdminHeaderUi } from '@admin/ui/admin-header/admin-header.ui';
import { MaintenancePage } from './features/error/maintenance/maintenance.page';
import { ToastComponent } from '@ui/toast/toast.component';
import { AuthService } from '@services/auth.service';
import { MaintenanceService } from '@services/maintenance.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DebugPanelUi, AdminHeaderUi, MaintenancePage, ToastComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly maintenanceSvc = inject(MaintenanceService);

  constructor() {
    effect(() => {
      document.body.classList.toggle('admin', this.authService.isAdmin());
    });
  }
}
