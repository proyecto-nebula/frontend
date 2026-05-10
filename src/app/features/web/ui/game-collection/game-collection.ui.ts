import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { CarouselComponent } from '@ui/carousel/carousel.component';
import { GameCardUi } from '../game-card/game-card.ui';

type Mode = 'publishedAt' | 'releaseDate' | 'custom';

@Component({
  selector: 'app-game-collection',
  standalone: true,
  imports: [CommonModule, CarouselComponent, GameCardUi],
  templateUrl: './game-collection.ui.html',
})
export class GameCollectionUi implements OnInit {
  @Input() title = '';
  @Input() mode: Mode = 'publishedAt';
  @Input() limit = 10;
  @Input() gamesInput: Game[] | null = null; // for custom collections

  readonly games = signal<Game[]>([]);

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

  private readonly gameService = inject(GameService);

  ngOnInit(): void {
    if (!this.gamesInput) {
      this.gameService.getGames().subscribe({ next: gs => this.games.set(gs || []), error: () => this.games.set([]) });
    }
  }
}
