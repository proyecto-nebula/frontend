import { Routes } from '@angular/router';
import { adminGuard } from '@guards/admin.guard';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@web/web.routes').then(m => m.WEB_ROUTES),
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () => import('@admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'admin',
    loadComponent: () => import('@shared/error/forbidden/forbidden.page').then(m => m.ForbiddenPage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadChildren: () => import('@settings/settings.routes').then(m => m.SETTINGS_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('@auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'play',
    loadChildren: () => import('@play/play.routes').then(m => m.PLAY_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('@shared/error/not-found/not-found.page').then(m => m.NotFoundPage),
  },
];
