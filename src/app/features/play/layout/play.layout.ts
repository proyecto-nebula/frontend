import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-play-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './play.layout.html',
})
export class PlayLayout implements OnDestroy {
  private body = document.body.classList.add('play');
  ngOnDestroy(): void {
    document.body.classList.remove('play');
  }
}
