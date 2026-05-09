import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin.layout.html',
  styleUrls: ['./admin.layout.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminLayout {}
