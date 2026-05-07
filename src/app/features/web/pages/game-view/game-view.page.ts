import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDetailsUi } from '../../ui/game-details/game-details.ui';

@Component({
  selector: 'app-game-view-page',
  standalone: true,
  imports: [CommonModule, GameDetailsUi],
  templateUrl: './game-view.page.html',
})
export class GameViewPage {
  private route = inject(ActivatedRoute);
  slug = signal<string>('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') ?? '');
    });
  }
}
