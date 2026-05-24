import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  exiting = false;
  private router = inject(Router);
  goHome(): void {
    this.exiting = true;
    setTimeout(() => this.router.navigate(['/']), 350);
  }
}
