import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin.layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'games', pathMatch: 'full' },
      { path: 'games',        loadComponent: () => import('./pages/games/games.page').then(m => m.AdminGamesPage) },
      { path: 'games/new',    loadComponent: () => import('./pages/games/games.page').then(m => m.AdminGamesPage) },
      { path: 'games/:id',    loadComponent: () => import('./pages/games/games.page').then(m => m.AdminGamesPage) },
      { path: 'avatars',      loadComponent: () => import('./pages/avatars/avatars.page').then(m => m.AdminAvatarsPage) },
      { path: 'avatars/new',  loadComponent: () => import('./pages/avatars/avatars.page').then(m => m.AdminAvatarsPage) },
      { path: 'avatars/:id',  loadComponent: () => import('./pages/avatars/avatars.page').then(m => m.AdminAvatarsPage) },
      { path: 'categories',     loadComponent: () => import('./pages/categories/categories.page').then(m => m.AdminCategoriesPage) },
      { path: 'categories/new', loadComponent: () => import('./pages/categories/categories.page').then(m => m.AdminCategoriesPage) },
      { path: 'categories/:id', loadComponent: () => import('./pages/categories/categories.page').then(m => m.AdminCategoriesPage) },
      { path: 'studios',      loadComponent: () => import('./pages/studios/studios.page').then(m => m.AdminStudiosPage) },
      { path: 'studios/new',  loadComponent: () => import('./pages/studios/studios.page').then(m => m.AdminStudiosPage) },
      { path: 'studios/:id',  loadComponent: () => import('./pages/studios/studios.page').then(m => m.AdminStudiosPage) },
      { path: 'plans',        loadComponent: () => import('./pages/plans/plans.page').then(m => m.AdminPlansPage) },
      { path: 'plans/new',    loadComponent: () => import('./pages/plans/plans.page').then(m => m.AdminPlansPage) },
      { path: 'plans/:id',    loadComponent: () => import('./pages/plans/plans.page').then(m => m.AdminPlansPage) },
      { path: 'reports',      loadComponent: () => import('./pages/reports/reports.page').then(m => m.AdminReportsPage) },
      { path: 'reports/:id',  loadComponent: () => import('./pages/reports/reports.page').then(m => m.AdminReportsPage) },
    ],
  },
];
