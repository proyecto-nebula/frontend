import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notfound-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './404.layout.html',
  styles: ['@use "404" as notfound;'],
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('layout-404');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('layout-404');
  }
}
