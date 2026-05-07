import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-play-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './play.layout.html',
})
export class PlayLayout {
  private _ = (document.body.id = 'play');
}
