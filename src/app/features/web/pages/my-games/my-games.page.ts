import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { UserService } from '@services/user.service';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';
import { GameListUi } from '@web/ui/game-list/game-list.ui';

@Component({
  selector: 'app-my-games-page',
  standalone: true,
  imports: [CommonModule, GameCollectionUi, GameListUi],
  templateUrl: './my-games.page.html',
})
export class MyGamesPage implements OnInit {
  private userService = inject(UserService);
  private gameService = inject(GameService);

  readonly isLoading = signal(true);
  readonly favoriteGames    = signal<Game[] | null>(null);
  readonly lastPlayedGames  = signal<Game[] | null>(null);
  readonly mostPlayedGames  = signal<Game[] | null>(null);
  readonly recommendedGames = signal<Game[] | null>(null);

  readonly totalPlayDisplay = computed(() => {
    const seconds = (this.mostPlayedGames() ?? []).reduce((acc, g) => acc + (Number(g.totalDuration) || 0), 0);
    const hours   = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  });

  ngOnInit(): void {
    this.userService.me().pipe(take(1)).subscribe(user => {
      if (user) {
        this.loadData(user.id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  private loadData(userId: number): void {
    forkJoin({
      favorites:    this.gameService.getFavoriteGames(userId),
      lastPlayed:   this.gameService.getLastPlayedGames(userId),
      mostPlayed:   this.gameService.getMostPlayedGames(userId, 1000),
      recommended:  this.gameService.getRecommended(userId),
    }).subscribe({
      next: ({ favorites, lastPlayed, mostPlayed, recommended }) => {
        this.favoriteGames.set(favorites);
        this.lastPlayedGames.set(lastPlayed);
        this.mostPlayedGames.set(mostPlayed);
        this.recommendedGames.set(recommended);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
