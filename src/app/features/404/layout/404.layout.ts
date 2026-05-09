import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notfound-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './404.layout.html',
  styles: ['@use "404" as notfound;'],
  encapsulation: ViewEncapsulation.None,
})
export class NotFoundLayout {
  private _ = (document.body.id = '404');
}
