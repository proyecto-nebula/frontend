import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  // BLOQUE 1: RUTAS PRIVADAS (App Principal)
  {
    path: '',
    canActivate: [authGuard], // El guard solo protege este bloque
    loadComponent: () => import('@main/main').then(m => m.MainLayout),
    children: [
      {
        path: 'dashboard', // Es mejor que la home tenga un path interno o sea la raíz protegida
        loadComponent: () => import('@main/main').then(m => m.MainLayout),
      },
      // Si quieres que la raíz / vaya a main después de pasar el guard:
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('@main/home/home').then(m => m.HomePage),
      },
    ],
  },

  // BLOQUE 2: ADMIN
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

  // BLOQUE 3: RUTAS PÚBLICAS (Login, etc.)
  {
    path: '',
    loadComponent: () => import('@auth/auth').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () => import('@auth/login/login').then(m => m.LoginPage),
      },
      // Si quieres que el usuario vea el login al entrar a la raíz Y no esté logueado:
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
