import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './main.html',
})
export class MainLayout {}
