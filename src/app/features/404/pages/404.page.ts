import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './404.page.html',
})
export class NotFoundPage {
  exiting = false;

  constructor(private router: Router) {}

  goHome() {
    if (this.exiting) return;
    this.exiting = true;
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 360);
  }
}
