import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '@models/game.model';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-list.ui.html',
})
export class GameListUi {
  @Input() games: Game[] | null = null;
  @Input() title = '';
  @Input() limit = 15;

  get topGames(): Game[] {
    return (this.games ?? []).slice(0, this.limit);
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${String(m).padStart(2, '0')}min`;
  }
}
