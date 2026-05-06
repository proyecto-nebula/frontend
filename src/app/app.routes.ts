import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@web/web.routes').then(m => m.WEB_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('@admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('@auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'play',
    loadChildren: () => import('@play/play.routes').then(m => m.PLAY_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
