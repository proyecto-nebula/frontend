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
})
export class GameCollectionUi {
  @Input() title = '';
  @Input() collection: Game[] | null = null;
  @Input() emptyMessage = '';
}
