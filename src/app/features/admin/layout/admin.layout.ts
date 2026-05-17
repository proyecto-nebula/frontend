import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderUi } from '../ui/admin-header/admin-header.ui';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderUi],
  templateUrl: './admin.layout.html',
})
export class AdminLayout {}
