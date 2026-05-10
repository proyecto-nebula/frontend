import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginFormComponent } from '@auth/components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent],
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
