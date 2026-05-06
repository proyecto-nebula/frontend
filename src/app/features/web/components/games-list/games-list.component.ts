import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Game } from '@models/game.model';
import { GameCardComponent } from '../game-card/game-card.component';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './games-list.component.html',
  
})
export class GamesListComponent {
  @Input() games: Game[] = [];
}
