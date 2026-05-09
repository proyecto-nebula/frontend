import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { CarouselModule } from 'primeng/carousel';
import { GameCardUi } from '../game-card/game-card.ui';

type Mode = 'publishedAt' | 'releaseDate' | 'custom';

@Component({
  selector: 'app-game-collection',
  standalone: true,
  imports: [CommonModule, CarouselModule, GameCardUi],
  templateUrl: './game-collection.ui.html',
})
export class GameCollectionUi implements OnInit {
  @Input() title = '';
  @Input() mode: Mode = 'publishedAt';
  @Input() limit = 10;
  @Input() gamesInput: Game[] | null = null; // for custom collections

  readonly games = signal<Game[]>([]);

  readonly responsiveOptions = [
    { breakpoint: '1600px', numVisible: 5, numScroll: 1 },
    { breakpoint: '1480px', numVisible: 4, numScroll: 1 },
    { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];

  readonly collection = computed(() => {
    const all = this.gamesInput ?? this.games();
    let arr = [...(all || [])];
    if (this.mode === 'publishedAt') {
      arr = arr
        .filter(g => !!g.publishedAt)
        .sort((a, b) => +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0));
    } else if (this.mode === 'releaseDate') {
      arr = arr
        .filter(g => !!g.releaseDate)
        .sort((a, b) => +new Date(b.releaseDate ?? 0) - +new Date(a.releaseDate ?? 0));
    }
    return arr.slice(0, this.limit);
  });

  get numVisible(): number {
    return Math.min(this.limit, 5);
  }

  private readonly gameService = inject(GameService);

  ngOnInit(): void {
    if (!this.gamesInput) {
      this.gameService.getGames().subscribe({ next: gs => this.games.set(gs || []), error: () => this.games.set([]) });
    }
  }
}
