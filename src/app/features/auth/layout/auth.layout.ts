import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth.layout.html',
  styles: ['@use "auth";'],
  encapsulation: ViewEncapsulation.None,
})
export class AuthLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('layout-auth');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('layout-auth');
  }
}
