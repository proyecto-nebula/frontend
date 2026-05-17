import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin.layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'games', pathMatch: 'full' },
      { path: 'games', loadComponent: () => import('./pages/games/games.page').then(m => m.AdminGamesPage) },
      { path: 'avatars', loadComponent: () => import('./pages/avatars/avatars.page').then(m => m.AdminAvatarsPage) },
      { path: 'categories', loadComponent: () => import('./pages/categories/categories.page').then(m => m.AdminCategoriesPage) },
      { path: 'studios', loadComponent: () => import('./pages/studios/studios.page').then(m => m.AdminStudiosPage) },
      { path: 'plans', loadComponent: () => import('./pages/plans/plans.page').then(m => m.AdminPlansPage) },
    ],
  },
];
