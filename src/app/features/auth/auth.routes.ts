import { Routes } from '@angular/router';
import { guestGuard } from '@guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/auth.layout').then(m => m.AuthLayout),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'join',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/join/join.page').then(m => m.JoinPage),
      },
    ],
  },
];
