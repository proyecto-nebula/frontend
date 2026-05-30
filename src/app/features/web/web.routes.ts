import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

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
        path: 'games/:slug',
        loadComponent: () => import('./pages/game-view/game-view.page').then(m => m.GameViewPage),
      },
      {
        path: 'my-games',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/my-games/my-games.page').then(m => m.MyGamesPage),
      },
      {
        path: 'discover',
        loadComponent: () => import('./pages/game-discover/game-discover.page').then(m => m.GameDiscoverPage),
      },
    ],
  },
];
