import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginFormUi } from '@auth/ui/login-form/login-form.ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormUi],
  template: `<app-login-form (loggedIn)="onLoggedIn()"></app-login-form>`,
})
export class LoginPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onLoggedIn() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      // Default after login from the dedicated login page: go home
      this.router.navigate(['/']);
    }
  }
}
