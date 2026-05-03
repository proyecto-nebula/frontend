import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-detail.component.html',
})
export class GameDetailComponent implements OnChanges {
  @Input() slug!: string;

  readonly game = signal<Game | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly gameService = inject(GameService);

  constructor() {}

  ngOnChanges(): void {
    if (!this.slug) {
      this.isLoading.set(false);
      this.error.set('No se ha proporcionado slug.');
      this.game.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.gameService.getGameBySlug(this.slug).subscribe({
      next: g => {
        if (!g) {
          this.error.set('Juego no encontrado.');
          this.game.set(null);
        } else {
          this.game.set(g);
        }
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set(err?.message || 'No se pudo cargar el juego');
        this.isLoading.set(false);
      },
    });
  }
}
