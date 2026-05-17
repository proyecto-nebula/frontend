import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  template: `
    <div class="error-page" [class.exiting]="exiting">
      <div class="error-page__body">
        <span class="error-page__code">404</span>
        <h1 class="error-page__title">Página no encontrada</h1>
        <p class="error-page__desc">La URL que buscas no existe o ha sido movida.</p>
        <button class="btn" (click)="goHome()">Volver al inicio</button>
      </div>
    </div>
  `,
})
export class NotFoundPage {
  exiting = false;
  private router = inject(Router);
  goHome(): void {
    this.exiting = true;
    setTimeout(() => this.router.navigate(['/']), 350);
  }
}
