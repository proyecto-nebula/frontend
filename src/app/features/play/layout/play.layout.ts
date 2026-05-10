import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-play-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './play.layout.html',
  styles: ['@use "play";'],
  encapsulation: ViewEncapsulation.None,
})
export class PlayLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('layout-play');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('layout-play');
  }
}
