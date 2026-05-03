import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal, ElementRef } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, GalleriaModule, DialogModule, ButtonModule],
  templateUrl: './game-detail.component.html',
})
export class GameDetailComponent implements OnChanges {
  @Input() slug!: string;

  readonly game = signal<Game | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly gameService = inject(GameService);
  // Prefetch state
  private prefetchCache = new Set<string>();
  private prefetchQueue: string[] = [];
  private concurrent = 0;
  private readonly MAX_CONCURRENCY = 3;

  // Dialog / gallery state
  showGallery = signal(false);
  activeIndex = signal(0);

  constructor(private host: ElementRef) {}

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
      next: game => {
        if (!game) {
          this.error.set('Juego no encontrado.');
          this.game.set(null);
        } else {
          this.game.set(game);
        }
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set(err?.message || 'No se pudo cargar el juego');
        this.isLoading.set(false);
      },
    });
  }

  // Prefetch a full image in background with concurrency limit
  prefetchFull(url: string) {
    if (!url || this.prefetchCache.has(url)) return;
    this.prefetchQueue.push(url);
    this.processQueue();
  }

  private processQueue() {
    while (this.concurrent < this.MAX_CONCURRENCY && this.prefetchQueue.length > 0) {
      const url = this.prefetchQueue.shift()!;
      if (this.prefetchCache.has(url)) continue;
      this.concurrent++;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.prefetchCache.add(url);
        this.concurrent--;
        this.processQueue();
      };
      img.onerror = () => {
        this.concurrent--;
        this.processQueue();
      };
      img.src = url;
    }
  }

  // Open gallery dialog at index
  openGallery(index: number) {
    this.activeIndex.set(index);
    this.showGallery.set(true);
    // prefetch nearby images
    const imgs = this.game()?.screenshots ?? [];
    [index - 1, index + 1].forEach(i => {
      if (i >= 0 && i < imgs.length) this.prefetchFull(imgs[i].imageUrl);
    });
  }
}
