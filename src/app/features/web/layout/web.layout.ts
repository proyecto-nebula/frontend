import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@web/ui/header/header.ui';

@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi],
  templateUrl: './web.layout.html',
})
export class WebLayout implements OnDestroy {
  private body = document.body.classList.add('web');
  ngOnDestroy(): void {
    document.body.classList.remove('web');
  }
}
