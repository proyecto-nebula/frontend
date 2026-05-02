import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  // BLOQUE 1: RUTAS PÚBLICAS (Home, juegos)
  {
    path: '',
    loadComponent: () => import('@main/main').then(m => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('@main/home/home').then(m => m.HomePage),
      },
      {
        path: 'games',
        loadComponent: () => import('@main/games/games-list-page/games-list-page').then(m => m.GamesListPage),
      },
      {
        path: 'games/:slug',
        loadComponent: () => import('@main/games/game-detail-page/game-detail-page').then(m => m.GameDetailPage),
      },
    ],
  },

  // BLOQUE 2: RUTAS PRIVADAS (dashboard, etc)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@main/main').then(m => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@main/main').then(m => m.MainLayout),
      },
      // Aquí puedes añadir más rutas privadas
    ],
  },

  // BLOQUE 3: ADMIN
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('@admin/admin').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('@admin/admin').then(m => m.AdminLayout),
      },
    ],
  },

  // BLOQUE 4: RUTAS DE AUTENTICACIÓN (Login, etc.)
  {
    path: '',
    loadComponent: () => import('@auth/auth').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('@auth/login/login').then(m => m.LoginPage),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
