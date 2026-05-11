import { Component, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin.layout.html',
})
export class AdminLayout implements OnDestroy {
  private body = document.body.classList.add('admin');
  ngOnDestroy(): void {
    document.body.classList.remove('admin');
  }
}
