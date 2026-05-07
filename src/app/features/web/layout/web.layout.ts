import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@components/header/header.component';

@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './web.layout.html',
})
export class WebLayout {
  private _ = (document.body.id = 'web');
}
