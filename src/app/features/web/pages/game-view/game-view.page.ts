import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { GameDetailsUi } from '@features/web/ui/game-details/game-details.ui';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';

@Component({
  selector: 'app-game-view-page',
  standalone: true,
  imports: [CommonModule, GameDetailsUi, GameCollectionUi],
  templateUrl: './game-view.page.html',
})
export class GameViewPage {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  private titleService = inject(Title);

  slug = signal<string>('');
  readonly isLoading = signal(true);
  readonly similarGames    = signal<Game[] | null>(null);
  readonly developerGames  = signal<Game[] | null>(null);
  readonly developerName   = signal<string | null>(null);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.slug.set(slug);
      this.isLoading.set(true);
      this.similarGames.set(null);
      this.developerGames.set(null);
      this.developerName.set(null);
    });
  }

  onLoadingDone(): void {
    this.isLoading.set(false);
  }

  onGameLoaded(game: Game): void {
    this.titleService.setTitle((game.title ?? 'Juego') + ' — Nebula');
    const slug = this.slug();
    this.developerName.set(game.developer?.name ?? null);
    this.gameService.getSimilarGames(slug).subscribe(g => this.similarGames.set(g));
    this.gameService.getGamesByDeveloper(slug).subscribe(g => this.developerGames.set(g));
  }
}
