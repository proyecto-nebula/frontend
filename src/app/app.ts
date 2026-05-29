import { AdminHeaderUi } from '@admin/ui/admin-header/admin-header.ui';
import { Component, effect, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
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
  protected readonly router = inject(Router);

  constructor() {
    effect(() => {
      document.body.classList.toggle('is-admin', this.authService.isAdminOrEditor());
    });

    // Initialize Vercel Speed Insights and update route on navigation
    try {
      const si = injectSpeedInsights({ framework: 'angular' });
      if (si) {
        // set initial route
        si.setRoute(location.pathname);
        // update on route changes
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            si.setRoute(location.pathname);
          }
        });
      }
    } catch (err) {
      // ignore if the integration fails (e.g., in non-browser environments)
      // console.warn('[SpeedInsights] init failed', err);
    }
  }
}
