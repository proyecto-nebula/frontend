import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@web/ui/header/header.ui';

@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi],
  templateUrl: './web.layout.html',
})
export class WebLayout {
  private _ = (document.body.id = 'web');
}
