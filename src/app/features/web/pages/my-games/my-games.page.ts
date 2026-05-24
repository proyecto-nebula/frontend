import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Game } from '@models/game.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';
import { GameListUi } from '@web/ui/game-list/game-list.ui';
import { catchError, distinctUntilChanged, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-my-games-page',
  standalone: true,
  imports: [CommonModule, GameCollectionUi, GameListUi],
  templateUrl: './my-games.page.html',
})
export class MyGamesPage {
  private authService = inject(AuthService);
  private gameService = inject(GameService);

  readonly isLoading = signal(true);
  readonly favoriteGames = signal<Game[] | null>(null);
  readonly lastPlayedGames = signal<Game[] | null>(null);
  readonly mostPlayedGames = signal<Game[] | null>(null);
  readonly recommendedGames = signal<Game[] | null>(null);

  readonly totalPlayDisplay = computed(() => {
    const seconds = (this.mostPlayedGames() ?? []).reduce((acc, g) => acc + (Number(g.totalDuration) || 0), 0);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  });

  constructor() {
    this.authService.user$
      .pipe(
        map(u => u?.id ?? null),
        distinctUntilChanged(),
        switchMap(userId => {
          this.isLoading.set(true);
          if (userId === null) {
            this.favoriteGames.set(null);
            this.lastPlayedGames.set(null);
            this.mostPlayedGames.set(null);
            this.recommendedGames.set(null);
            this.isLoading.set(false);
            return of(null);
          }
          return forkJoin({
            favorites: this.gameService.getFavoriteGames(userId).pipe(catchError(() => of([]))),
            lastPlayed: this.gameService.getLastPlayedGames(userId).pipe(catchError(() => of([]))),
            mostPlayed: this.gameService.getMostPlayedGames(userId, 1000).pipe(catchError(() => of([]))),
            recommended: this.gameService.getRecommended(userId).pipe(catchError(() => of([]))),
          });
        }),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        if (!result) return;
        this.favoriteGames.set(result.favorites);
        this.lastPlayedGames.set(result.lastPlayed);
        this.mostPlayedGames.set(result.mostPlayed);
        this.recommendedGames.set(result.recommended);
        this.isLoading.set(false);
      });
  }
}
