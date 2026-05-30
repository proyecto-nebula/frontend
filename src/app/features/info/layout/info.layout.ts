import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@ui/header/header.ui';
import { FooterUi } from '@ui/footer/footer.ui';

@Component({
  selector: 'app-info-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi, FooterUi],
  templateUrl: './info.layout.html',
})
export class InfoLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('info');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('info');
  }
}
