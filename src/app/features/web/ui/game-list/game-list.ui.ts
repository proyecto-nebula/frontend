import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Game } from '@models/game.model';
import { GameCardUi } from '../game-card/game-card.ui';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, GameCardUi],
  templateUrl: './game-list.ui.html',
})
export class GameListUi {
  @Input() games: Game[] = [];
}
