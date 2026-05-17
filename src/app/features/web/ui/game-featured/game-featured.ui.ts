import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, AfterViewInit, OnDestroy, ElementRef, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { GameHeaderUi } from '../game-header/game-header.ui';

@Component({
  selector: 'app-game-featured',
  standalone: true,
  imports: [CommonModule, CarouselModule, GameHeaderUi],
  templateUrl: './game-featured.ui.html',
})
export class GameFeaturedUi implements OnInit, AfterViewInit, OnDestroy {
  @Input() autoplayInterval = 5000;

  readonly games = signal<Game[]>([]);
  readonly featuredGames = computed(() =>
    this.games().filter(g => {
      const v = g.isFeatured;
      return v === true || v === '1' || v === 'true' || v === 'yes' || Number(v) === 1;
    }),
  );

  private readonly gameService = inject(GameService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private resizeListener?: () => void;
  private observer: MutationObserver | null = null;

  ngOnInit(): void {
    this.gameService.getGames().subscribe({
      next: gs => {
        this.games.set(gs || []);
        setTimeout(() => this.adjustCarouselHeight(), 0);
      },
      error: () => {
        this.games.set([]);
        setTimeout(() => this.adjustCarouselHeight(), 0);
      },
    });
  }

  ngAfterViewInit(): void {
    // initial adjust after view render
    setTimeout(() => this.adjustCarouselHeight(), 0);

    // handle window resize
    this.resizeListener = () => this.adjustCarouselHeight();
    window.addEventListener('resize', this.resizeListener);

    // observe active item attribute changes to update height when carousel slides
    const root = this.host.nativeElement as HTMLElement;
    const carouselEl = root.querySelector('.game-featured-carousel');
    if (carouselEl) {
      this.observer = new MutationObserver(() => this.adjustCarouselHeight());
      this.observer.observe(carouselEl, { subtree: true, attributes: true, attributeFilter: ['data-p-carousel-item-active'] });
    }
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private adjustCarouselHeight(): void {
    const root = this.host.nativeElement as HTMLElement;
    const viewport = root.querySelector('.game-featured-carousel .p-carousel-viewport') as HTMLElement | null;
    if (!viewport) return;

    // Always measure the inner app-game-header content element (not the absolutely-
    // positioned p-carousel-item whose height == viewport height → circular dependency).
    const activeItem = root.querySelector('.game-featured-carousel .p-carousel-item[data-p-carousel-item-active="true"]') as HTMLElement | null;
    const target = (activeItem?.querySelector('app-game-header') as HTMLElement | null)
      ?? (root.querySelector('.game-featured-carousel app-game-header') as HTMLElement | null);

    if (!target) {
      viewport.style.height = '';
      return;
    }

    const imgs = Array.from(target.querySelectorAll('img')) as HTMLImageElement[];
    const unfinished = imgs.filter(img => !img.complete);
    if (unfinished.length > 0) {
      let remaining = unfinished.length;
      const onLoad = () => {
        remaining--;
        if (remaining <= 0) this.setViewportHeight(viewport, target);
      };
      unfinished.forEach(img => img.addEventListener('load', onLoad, { once: true }));
      setTimeout(() => this.setViewportHeight(viewport, target), 1000);
    } else {
      this.setViewportHeight(viewport, target);
    }
  }

  private setViewportHeight(viewport: HTMLElement, target: HTMLElement): void {
    const h = target.offsetHeight || target.clientHeight || 0;
    if (h > 0) {
      viewport.style.height = `${h}px`;
    } else {
      viewport.style.height = '';
    }
  }
}
