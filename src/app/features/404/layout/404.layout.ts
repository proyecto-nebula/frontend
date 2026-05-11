import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notfound-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './404.layout.html',
})
export class NotFoundLayout implements OnDestroy {
  private body = document.body.classList.add('404');
  ngOnDestroy(): void {
    document.body.classList.remove('404');
  }
}
