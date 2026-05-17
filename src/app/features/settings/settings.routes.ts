import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/settings.layout').then(m => m.SettingsLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
      },
      {
        path: 'plan',
        loadComponent: () => import('./pages/plan/plan.page').then(m => m.PlanPage),
      },
    ],
  },
];
