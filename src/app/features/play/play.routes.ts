import { Routes } from '@angular/router';

export const PLAY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/play.layout').then(m => m.PlayLayout),
    children: [
      {
        path: ':slug',
        loadComponent: () => import('./pages/game/game.page').then(m => m.PlayGamePage),
      },
    ],
  },
];
