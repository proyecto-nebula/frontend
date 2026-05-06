import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Game } from '@models/game.model';
import { GameCardComponent } from '../game-card/game-card';

@Component({
  selector: 'app-games-list',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './games-list.html',
  styleUrls: ['./games-list.scss'],
})
export class GamesListComponent {
  @Input() games: Game[] = [];
}
