import { AdminHeaderUi } from '@admin/ui/admin-header/admin-header.ui';
import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { MaintenanceService } from '@services/maintenance.service';
import { MaintenancePage } from '@shared/error/maintenance/maintenance.page';
import { DebugPanelUi } from '@ui/debug-panel/debug-panel.ui';
import { ToastComponent } from '@ui/toast/toast.component';

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
      document.body.classList.toggle('is-admin', this.authService.isAdminOrEditor());
    });
  }
}
