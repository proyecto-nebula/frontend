import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@components/header/header';

@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './web.layout.html',
})
export class WebLayout {}
