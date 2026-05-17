import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Game } from '@models/game.model';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-header.ui.html',
  styles: [':host { display: block; }'],
})
export class GameHeaderUi {
  @Input() game: Game | null = null;
  /** 'detail' = game-view page; 'featured' = home featured carousel */
  @Input() mode: 'detail' | 'featured' = 'detail';
  /** Slug used for /play/:slug routing (detail mode) */
  @Input() slug = '';
  @Input() isLoggedIn = false;
  @Input() hasPlan = false;
  @Input() isFavorite = false;
  @Input() favoriteLoading = false;

  @Output() favToggle = new EventEmitter<void>();
}
