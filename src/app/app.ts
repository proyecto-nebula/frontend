import { Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { DebugPanelUi } from '@ui/debug-panel/debug-panel.ui';
import { AdminHeaderUi } from '@admin/ui/admin-header/admin-header.ui';
import { MaintenancePage } from '@shared/error/maintenance/maintenance.page';
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
  private readonly router = inject(Router);

  private readonly isAdminZone = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );

  protected readonly showGlobalAdminHeader = computed(
    () => this.authService.isAdmin() && !this.isAdminZone(),
  );

  constructor() {
    effect(() => {
      document.body.classList.toggle('admin', this.authService.isAdmin());
    });
  }
}
