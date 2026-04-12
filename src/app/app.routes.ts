import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  // BLOQUE 1: RUTAS PÚBLICAS (Login, etc.)
  {
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('@features/auth/login/login').then(m => m.LoginComponent),
      },
      // Si quieres que el usuario vea el login al entrar a la raíz Y no esté logueado:
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // BLOQUE 2: RUTAS PRIVADAS (App Principal)
  {
    path: '',
    canActivate: [authGuard], // El guard solo protege este bloque
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: 'dashboard', // Es mejor que la home tenga un path interno o sea la raíz protegida
        loadComponent: () => import('@features/main/main').then(m => m.Main),
      },
      // Si quieres que la raíz / vaya a main después de pasar el guard:
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('@features/main/main').then(m => m.Main),
      },
    ],
  },

  // BLOQUE 3: ADMIN
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('@features/admin/admin').then(m => m.Admin),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
