import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { AuthService } from '@services/auth.service';
import { ReportsBadgeService } from '@services/reports-badge.service';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-header.ui.html',
})
export class AdminHeaderUi implements OnInit {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  readonly badge = inject(ReportsBadgeService);

  menuOpen = signal(false);

  readonly isAdminZone = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/admin')),
      startWith(this.router.url.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );

  // Mostrar el nombre del rol en la barra (Admin o Editor)
  readonly roleName = computed(() => {
    const u = this.auth.user();
    if (u?.role?.name) return u.role.name;
    if (this.auth.isAdmin()) return 'Admin';
    if (this.auth.isEditor()) return 'Editor';
    return 'Admin';
  });

  ngOnInit(): void {
    this.http.get<{ id: number }[]>(`${API_ROUTES.reports}?is_solved=0`).subscribe({
      next: list => this.badge.set(list.length),
      error: () => {},
    });
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
