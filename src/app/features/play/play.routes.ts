import { Routes } from '@angular/router';
import { ageGuard } from '@guards/age.guard';

export const PLAY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/play.layout').then(m => m.PlayLayout),
    children: [
      {
        path: ':slug',
        canMatch: [ageGuard],
        loadComponent: () => import('./pages/game/game.page').then(m => m.PlayGamePage),
      },
      {
        path: ':slug',
        loadComponent: () => import('@shared/error/forbidden/forbidden.page').then(m => m.ForbiddenPage),
      },
    ],
  },
];
