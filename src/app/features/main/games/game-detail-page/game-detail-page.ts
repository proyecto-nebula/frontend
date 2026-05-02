import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameDetailComponent } from '@shared/components/games/game-detail/game-detail.component';

@Component({
  selector: 'app-game-detail-page',
  standalone: true,
  imports: [CommonModule, GameDetailComponent],
  templateUrl: './game-detail-page.html',
})
export class GameDetailPage {
  private route = inject(ActivatedRoute);
  slug = signal<string>('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') ?? '');
    });
  }
}
