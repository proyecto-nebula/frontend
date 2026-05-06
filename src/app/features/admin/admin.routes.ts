import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin.layout').then(m => m.AdminLayout),
    children: [],
  },
];
