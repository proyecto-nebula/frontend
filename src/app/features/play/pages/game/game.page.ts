import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@services/game.service';
import { Game } from '@models/game.model';

@Component({
  selector: 'app-play-game-page',
  standalone: true,
  template: `
    @if (game()) {
      <div class="play-game">
        <h1>{{ game()!.title }}</h1>
      </div>
    }
  `,
})
export class PlayGamePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);

  readonly game = signal<Game | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (slug) {
      this.gameService.getGameBySlug(slug).subscribe(g => this.game.set(g));
    }
  }
}
