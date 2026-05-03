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
    // Avoid prefetch on very slow connections
    try {
      const conn = (navigator as any)?.connection;
      if (conn && typeof conn.effectiveType === 'string' && conn.effectiveType.includes('2g')) return;
    } catch (e) {
      // ignore
    }
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
  openGallery(index?: number) {
    const idx = (typeof index === 'number' && !isNaN(index)) ? index : 0;
    this.activeIndex.set(idx);
    this.showGallery.set(true);
    // prefetch nearby images
    const imgs = this.game()?.screenshots ?? [];
    [idx - 1, idx + 1].forEach(i => {
      if (i >= 0 && i < imgs.length) this.prefetchFull(imgs[i].imageUrl);
    });
  }

  // Open gallery by shot object (safer than indexOf in templates)
  openGalleryByShot(shot: { imageUrl?: string }) {
    const imgs = this.game()?.screenshots ?? [];
    const idx = imgs.findIndex(s => s.imageUrl === shot.imageUrl);
    this.openGallery(idx >= 0 ? idx : 0);
  }

  // IntersectionObserver for thumbnails prefetch
  private observer: IntersectionObserver | null = null;

  private setupObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const url = el.getAttribute('data-full') || '';
          if (url) this.prefetchFull(url);
          this.observer?.unobserve(el);
        }
      }
    }, { rootMargin: '200px', threshold: 0.1 });

    // observe current thumbnails
    // run after render
    setTimeout(() => {
      const hostEl = this.host?.nativeElement as HTMLElement;
      if (!hostEl) return;
      const thumbs = hostEl.querySelectorAll('.thumb[data-full]');
      thumbs.forEach(t => this.observer?.observe(t));
    }, 50);
  }
}
