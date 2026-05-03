import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal, ElementRef } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, GalleriaModule, DialogModule, ButtonModule, ProgressSpinnerModule],
  styles: [`.lightbox-content img{transition:opacity .35s ease-in-out}.loading-image{opacity:0}`],
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
          // setup intersection observer for thumbnails after setting game
          this.setupObserver();
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
    this.loadingIndex.set(idx);
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
    // ensure dialog is opened first, then set active index to ensure correct image
    const target = idx >= 0 ? idx : 0;
    this.showGallery.set(true);
    // small delay so dialog initializes
    setTimeout(() => {
      this.openGallery(target);
    }, 0);
  }

  currentImageUrl(): string | undefined {
    return this.game()?.screenshots?.[this.activeIndex()]?.imageUrl;
  }

  onFullLoad() {
    // hide spinner
    this.loadingIndex.set(-1);
  }

  // navigation
  next() {
    const imgs = this.game()?.screenshots ?? [];
    const nextIdx = Math.min(this.activeIndex() + 1, imgs.length - 1);
    this.activeIndex.set(nextIdx);
    this.loadingIndex.set(nextIdx);
    // prefetch following images
    for (let i = nextIdx + 1; i <= nextIdx + 3 && i < imgs.length; i++) {
      this.prefetchFull(imgs[i].imageUrl);
    }
  }

  prev() {
    const prevIdx = Math.max(this.activeIndex() - 1, 0);
    this.activeIndex.set(prevIdx);
    this.loadingIndex.set(prevIdx);
  }

  // loading indicator index (signal)
  loadingIndex = signal<number>(-1);

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
