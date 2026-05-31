import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterUi } from '@ui/footer/footer.ui';

@Component({
  selector: 'app-play-layout',
  standalone: true,
  imports: [RouterOutlet, FooterUi],
  templateUrl: './play.layout.html',
})
export class PlayLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('play');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('play');
  }

  onClose(): void {
    try {
      window.history.back();
    } catch {
      // noop
    }
  }
}
