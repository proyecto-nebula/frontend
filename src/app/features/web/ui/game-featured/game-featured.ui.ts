import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { GameHeroUi } from '../game-hero/game-hero.ui';

@Component({
  selector: 'app-game-featured',
  standalone: true,
  imports: [CommonModule, GameHeroUi],
  templateUrl: './game-featured.ui.html',
})
export class GameFeaturedUi implements OnInit, OnDestroy {
  @Input() autoplayInterval = 5000;

  readonly games = signal<Game[]>([]);
  readonly paused = signal(false);
  readonly currentPage = signal(0);
  /** Índice del slide que está saliendo (animación leave). -1 = ninguno. */
  readonly prevPage = signal(-1);

  readonly featuredGames = computed(() =>
    this.games().filter(g => {
      const v = g.isFeatured;
      return v === true || v === '1' || v === 'true' || v === 'yes' || Number(v) === 1;
    }),
  );

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private clearPrevTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly gameService = inject(GameService);

  togglePause(): void {
    this.paused.update(p => !p);
    if (this.paused()) {
      this.stopAutoplay();
    } else {
      this.startAutoplay();
    }
  }

  goTo(index: number): void {
    if (index === this.currentPage()) return;
    this.prevPage.set(this.currentPage());
    this.currentPage.set(index);
    // limpia el slide saliente después de la animación
    if (this.clearPrevTimer !== null) clearTimeout(this.clearPrevTimer);
    this.clearPrevTimer = setTimeout(() => this.prevPage.set(-1), 900);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.autoplayInterval > 0) {
      this.autoplayTimer = setInterval(() => {
        const total = this.featuredGames().length;
        if (total > 1) {
          this.goTo((this.currentPage() + 1) % total);
        }
      }, this.autoplayInterval);
    }
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  ngOnInit(): void {
    this.gameService.getGames().subscribe({
      next: gs => {
        this.games.set(gs || []);
        this.startAutoplay();
      },
      error: () => {
        this.games.set([]);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.clearPrevTimer !== null) clearTimeout(this.clearPrevTimer);
  }
}

