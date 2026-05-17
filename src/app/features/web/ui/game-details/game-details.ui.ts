import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, EventEmitter, HostListener, inject, Input, OnChanges, Output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '@models/game.model';
import { AuthService } from '@services/auth.service';
import { FavoritesService } from '@services/favorites.service';
import { GameService } from '@services/game.service';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { GameScreenshotsUi } from '../game-screenshots/game-screenshots.ui';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, GameScreenshotsUi, SharedUiModule],
  templateUrl: './game-details.ui.html',
})
export class GameDetailsUi implements OnChanges {
  @Input() slug!: string;
  @Output() gameLoaded = new EventEmitter<Game>();

  readonly game = signal<Game | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly galleryVisible = signal(false);
  readonly activeGalleryIndex = signal(0);
  readonly galleryImages = computed(() =>
    (this.game()?.screenshots ?? []).map((screenshot, index) => ({
      itemImageSrc: screenshot.imageUrl,
      thumbnailImageSrc: screenshot.thumbUrl,
      alt: `${this.game()?.title ?? 'Screenshot'} ${index + 1}`,
    })),
  );

  readonly isFavorite = signal(false);
  readonly favoriteLoading = signal(false);

  private readonly gameService = inject(GameService);
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);

  private readonly currentUser = toSignal(this.authService.user$);
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly hasPlan = computed(() => {
    const u = this.currentUser();
    return u != null && u.planId != null && Number(u.planId) > 0;
  });

  private _favoriteSub?: Subscription;

  private readonly _favoriteEffect = effect(() => {
    const user = this.currentUser();
    const game = this.game();
    this._favoriteSub?.unsubscribe();
    if (user && game) {
      this._favoriteSub = this.favoritesService.isFavorite(user.id, Number(game.id)).subscribe(v => this.isFavorite.set(v));
    } else {
      this.isFavorite.set(false);
    }
  });

  openGallery(index: number): void {
    const images = this.galleryImages();
    if (!images || images.length === 0) return;
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    // Set index FIRST so the modal renders with the correct image from the start
    this.activeGalleryIndex.set(clamped);
    this.galleryVisible.set(true);
  }

  prevImage(): void {
    const images = this.galleryImages();
    if (!images || images.length === 0) return;
    const i = this.activeGalleryIndex();
    const prev = (i - 1 + images.length) % images.length;
    this.activeGalleryIndex.set(prev);
  }

  nextImage(): void {
    const images = this.galleryImages();
    if (!images || images.length === 0) return;
    const i = this.activeGalleryIndex();
    const next = (i + 1) % images.length;
    this.activeGalleryIndex.set(next);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (!this.galleryVisible()) return;
    if (e.key === 'ArrowLeft') {
      this.prevImage();
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      this.nextImage();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this.galleryVisible.set(false);
    }
  }

  onGalleryVisibleChange(visible: boolean): void {
    this.galleryVisible.set(visible);
  }

  ngOnChanges(): void {
    this.isFavorite.set(false);
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
          this.gameLoaded.emit(g);
        }
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set(err?.message || 'No se pudo cargar el juego');
        this.isLoading.set(false);
      },
    });
  }

  toggleFavorite(): void {
    const user = this.currentUser();
    const game = this.game();
    if (!user || !game) return;

    this.favoriteLoading.set(true);

    if (this.isFavorite()) {
      this.favoritesService.removeFavorite(Number(game.id)).subscribe({
        next: () => {
          this.isFavorite.set(false);
          this.favoriteLoading.set(false);
        },
        error: () => this.favoriteLoading.set(false),
      });
    } else {
      this.favoritesService.addFavorite(user.id, Number(game.id)).subscribe({
        next: () => {
          this.isFavorite.set(true);
          this.favoriteLoading.set(false);
        },
        error: () => this.favoriteLoading.set(false),
      });
    }
  }
}
