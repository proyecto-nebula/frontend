import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-game-featured',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './game-featured.ui.html',
})
export class GameFeaturedUi implements OnInit {
  @Input() autoplayInterval = 5000;

  readonly games = signal<Game[]>([]);
  readonly featuredGames = computed(() =>
    this.games().filter(g => {
      const v = g.isFeatured;
      return v === true || v === '1' || v === 'true' || v === 'yes' || Number(v) === 1;
    }),
  );

  private readonly gameService = inject(GameService);

  ngOnInit(): void {
    this.gameService.getGames().subscribe({
      next: gs => this.games.set(gs || []),
      error: () => this.games.set([]),
    });
  }
}
