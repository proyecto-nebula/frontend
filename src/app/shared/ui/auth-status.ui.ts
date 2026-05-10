import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { LoginModalService } from '@services/login-modal.service';

@Component({
  selector: 'shared-auth-status-ui',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule, ButtonModule],
  templateUrl: './auth-status.ui.html',
  styleUrls: ['./auth-status.ui.scss'],
})
export class AuthStatusUi implements OnInit {
  private auth = inject(AuthService);
  private userSvc = inject(UserService);
  private router = inject(Router);
  private loginModal = inject(LoginModalService);

  user: any = null;

  ngOnInit() {
    // prefer reactive auth user stream so UI updates after login without reload
    this.auth.user$.subscribe((u) => {
      this.user = u;
      console.log('[AuthStatusUi] user', u, 'token=', this.auth.getToken());
    });
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  logout() {
    this.auth.logout();
    // SPA navigation to avoid full reload (header and other components are reactive)
    this.router.navigate(['/']);
  }

  openLogin() {
    this.loginModal.open(this.router.url || '/');
  }
}
