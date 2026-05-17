import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  template: `
    <div class="error-page">
      <div class="error-page__body">
        <span class="error-page__code">403</span>
        <h1 class="error-page__title">Acceso denegado</h1>
        <p class="error-page__desc">No tienes permiso para ver esta página.</p>
        <button class="btn" (click)="goHome()">Volver al inicio</button>
      </div>
    </div>
  `,
})
export class ForbiddenPage {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/']); }
}
