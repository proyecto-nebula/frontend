import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, OnChanges, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, GalleriaModule, ButtonModule, ProgressSpinnerModule],
  styles: [
    `
      .lightbox-content img {
        transition: opacity 0.35s ease-in-out;
      }
      .loading-image {
        opacity: 0;
      }
      .lightbox-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
      }
      /* hide galleria thumbnails (use fullscreen overlay) */
      ::ng-deep .p-galleria-thumbnails {
        display: none !important;
      }
    `,
  ],
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

  // Gallery state
  galleriaVisible = signal(false);
  activeIndex = signal(0);

  constructor(private host: ElementRef) {}

  onDialogHide() {
    // compatibility: keep available but hide spinner
    this.loadingIndex.set(-1);
  }

  onGalleriaHide() {
    this.loadingIndex.set(-1);
  }

  onGalleriaVisibleChange(visible: boolean) {
    if (!visible) this.loadingIndex.set(-1);
    this.galleriaVisible.set(visible);
  }
  onActiveIndexChange(idx: number) {
    this.activeIndex.set(idx);
    this.loadingIndex.set(idx);
  }

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
    const idx = typeof index === 'number' && !isNaN(index) ? index : 0;
    this.activeIndex.set(idx);
    // set the visible signal to true so galleria opens
    setTimeout(() => this.galleriaVisible.set(true), 0);
    this.loadingIndex.set(idx);
    // prefetch nearby images
    const imgs = this.game()?.screenshots ?? [];
    // prefetch 3 previous and 3 next
    for (let i = idx - 3; i <= idx + 3; i++) {
      if (i >= 0 && i < imgs.length) this.prefetchFull(imgs[i].imageUrl);
    }
    // ensure that if the image is already in cache and complete we hide spinner
    setTimeout(() => {
      const hostEl = this.host?.nativeElement as HTMLElement;
      if (!hostEl) return;
      const img = hostEl.querySelector('.lightbox-content img') as HTMLImageElement | null;
      if (img && img.complete) {
        this.onFullLoad();
      }
    }, 50);
  }

  // Open gallery by shot object (safer than indexOf in templates)
  openGalleryByShot(shot: { imageUrl?: string }) {
    const imgs = this.game()?.screenshots ?? [];
    const idx = imgs.findIndex(s => s.imageUrl === shot.imageUrl);
    // ensure dialog is opened first, then set active index to ensure correct image
    const target = idx >= 0 ? idx : 0;
    this.activeIndex.set(target);
    setTimeout(() => this.galleriaVisible.set(true), 0);
  }

  private openGalleriaFullscreen() {
    // open gallery via visible signal and try Fullscreen API on rendered element as fallback
    try {
      this.galleriaVisible.set(true);
      setTimeout(() => {
        try {
          const hostEl = this.host?.nativeElement as HTMLElement;
          if (!hostEl) return;
          const gEl = hostEl.querySelector('.p-galleria') as HTMLElement | null;
          if (!gEl) return;
          const fs = (gEl as any).requestFullscreen ?? (gEl as any).webkitRequestFullscreen ?? (gEl as any).msRequestFullscreen;
          if (fs) fs.call(gEl);
        } catch (e) {}
      }, 200);
    } catch (e) {
      // ignore
    }
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
    const nextIdx = imgs.length ? (this.activeIndex() + 1) % imgs.length : 0;
    this.activeIndex.set(nextIdx);
    this.loadingIndex.set(nextIdx);
    // prefetch following images
    for (let offset = -3; offset <= 3; offset++) {
      const i = (nextIdx + offset + imgs.length) % imgs.length;
      if (i >= 0 && i < imgs.length) this.prefetchFull(imgs[i].imageUrl);
    }
  }

  prev() {
    const imgs = this.game()?.screenshots ?? [];
    const prevIdx = imgs.length ? (this.activeIndex() - 1 + imgs.length) % imgs.length : 0;
    this.activeIndex.set(prevIdx);
    this.loadingIndex.set(prevIdx);
    for (let offset = -3; offset <= 3; offset++) {
      const i = (prevIdx + offset + imgs.length) % imgs.length;
      if (i >= 0 && i < imgs.length) this.prefetchFull(imgs[i].imageUrl);
    }
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
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const url = el.getAttribute('data-full') || '';
            if (url) this.prefetchFull(url);
            this.observer?.unobserve(el);
          }
        }
      },
      { rootMargin: '200px', threshold: 0.1 },
    );

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
