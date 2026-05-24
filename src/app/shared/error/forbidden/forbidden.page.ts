import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  templateUrl: './forbidden.page.html',
})
export class ForbiddenPage {
  private router = inject(Router);
  goHome(): void { this.router.navigate(['/']); }
}
