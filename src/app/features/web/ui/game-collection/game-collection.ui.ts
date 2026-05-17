import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Game } from '@models/game.model';
import { CarouselComponent } from '@ui/carousel/carousel.component';
import { GameCardUi } from '../game-card/game-card.ui';

@Component({
  selector: 'app-game-collection',
  standalone: true,
  imports: [CommonModule, CarouselComponent, GameCardUi],
  templateUrl: './game-collection.ui.html',
  styles: [
    `
      .game-collection-empty {
        width: 100%;
        height: 100px;
        border: 3px dashed rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.95rem;
        margin: 8px 0;
      }
    `,
  ],
})
export class GameCollectionUi {
  @Input() title = '';
  @Input() collection: Game[] | null = null;
  @Input() emptyMessage = '';
}
