import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/settings.layout').then(m => m.SettingsLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account',
      },
      {
        path: 'account',
        loadComponent: () => import('./pages/account/account.page').then(m => m.AccountPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
      },
      {
        path: 'plan',
        loadComponent: () => import('./pages/plan/plan.page').then(m => m.PlanPage),
      },
    ],
  },
];
