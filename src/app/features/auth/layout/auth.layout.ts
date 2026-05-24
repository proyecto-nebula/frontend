import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '../../web/ui/header/header.ui';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi],
  templateUrl: './auth.layout.html',
})
export class AuthLayout implements OnDestroy {
  private body = document.body.classList.add('auth');
  ngOnDestroy(): void {
    document.body.classList.remove('auth');
  }
}
