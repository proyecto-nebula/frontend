import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import { LoginModalService } from '@services/login-modal.service';
import { User } from '@models/user.model';
import { AvatarModule } from 'primeng/avatar';
import { environment } from '@env/environment';
import { API_ROUTES } from '@config/api.routes';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule],
  templateUrl: './auth-status.ui.html',
  styleUrls: ['./auth-status.ui.scss'],
})
export class DebugPanelUi implements OnInit {
  protected readonly isProd = environment.production;

  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private loginModal = inject(LoginModalService);

  user: User | null = null;
  users: User[] = [];

  ngOnInit() {
    if (this.isProd) return;
    this.auth.user$.subscribe(u => (this.user = u));
    this.http.get<User[]>(API_ROUTES.users).subscribe({
      next: list => {
        this.users = list;
        const debugId = localStorage.getItem('debugUserId');
        if (debugId) {
          const u = list.find(u => String(u.id) === debugId);
          if (u) this.auth.debugSetUser(u);
        }
      },
      error: () => {},
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
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openLogin() {
    this.loginModal.open(this.router.url || '/');
  }
}

