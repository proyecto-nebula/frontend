import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { environment } from '@env/environment';
import { User } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { LoginModalService } from '@services/login-modal.service';
import { SettingsService } from '@services/settings.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule],
  templateUrl: './debug-panel.ui.html',
})
export class DebugPanelUi implements OnInit {
  protected readonly isProd = environment.production;

  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private loginModal = inject(LoginModalService);
  private settings = inject(SettingsService);

  user: User | null = null;
  users: User[] = [];

  ngOnInit() {
    if (this.isProd) return;

    // Pre-load from cache so the switcher works even before the first successful fetch
    const cached = localStorage.getItem('debugUsers');
    if (cached) {
      try {
        this.users = JSON.parse(cached);
      } catch {
        /* ignore */
      }
    }

    this.loadUsers();

    // Retry loading when auth state changes (e.g. after logging in)
    this.auth.user$.subscribe(u => {
      this.user = u;
      if (this.users.length === 0) this.loadUsers();
    });
  }

  private loadUsers(): void {
    this.http.get<User[] | User>(`${API_ROUTES.users}?list=1`).subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : [];
        this.users = list;
        localStorage.setItem('debugUsers', JSON.stringify(list));
        const debugId = localStorage.getItem('debugUserId');
        // Only auto-apply a persisted debug user when there's no authenticated session
        if (debugId && !this.auth.isAuthenticated()) {
          const u = list.find(u => String(u.id) === debugId);
          if (u) this.auth.debugSetUser(u);
        }
      },
      error: () => {
        /* use cached list */
      },
    });
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  switchUser(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    const target = this.users.find(u => Number(u.id) === id);
    if (target) {
      localStorage.setItem('debugUserId', String(id));
      this.auth.debugSetUser(target);
      window.location.reload();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openLogin() {
    this.loginModal.open(this.router.url || '/');
  }

  passwordValidationEnabled(): boolean {
    return this.settings.getPasswordValidationEnabled();
  }

  onTogglePasswordValidation(event: Event) {
    const checked = !!(event.target as HTMLInputElement).checked;
    this.settings.setPasswordValidationEnabled(checked);
  }
}
