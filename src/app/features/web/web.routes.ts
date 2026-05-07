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
        loadComponent: () => import('./pages/game-list/game-list.page').then(m => m.GameListPage),
      },
      {
        path: 'games/:slug',
        loadComponent: () => import('./pages/game-view/game-view.page').then(m => m.GameViewPage),
      },
    ],
  },
];
