import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@ui/header/header.ui';
import { FooterUi } from '@ui/footer/footer.ui';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi, FooterUi],
  templateUrl: './auth.layout.html',
})
export class AuthLayout implements OnDestroy {
  private body = document.body.classList.add('auth');
  ngOnDestroy(): void {
    document.body.classList.remove('auth');
  }
}
