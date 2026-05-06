import { Routes } from '@angular/router';

export const WEB_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/web.layout').then(m => m.WebLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'games',
        loadComponent: () => import('./pages/games-list/games-list.page').then(m => m.GamesListPage),
      },
      {
        path: 'games/:slug',
        loadComponent: () => import('./pages/game-detail/game-detail.page').then(m => m.GameDetailPage),
      },
    ],
  },
];
