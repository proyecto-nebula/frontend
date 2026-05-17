import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Game } from '@models/game.model';
import { AuthService } from '@services/auth.service';
import { FavoritesService } from '@services/favorites.service';
import { GameService } from '@services/game.service';
import { Subscription } from 'rxjs';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { GameHeaderUi } from '../game-header/game-header.ui';
import { GameScreenshotsUi } from '../game-screenshots/game-screenshots.ui';
import { GameVideosUi } from '../game-videos/game-videos.ui';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterModule,
    SafePipe,
    GameHeaderUi,
    GameScreenshotsUi,
    SharedUiModule,
    GameVideosUi,
  ],
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

  readonly videoVisible = signal(false);
  readonly activeVideoIndex = signal(-1);
  readonly activeVideoEmbedUrl = computed(() => {
    const v = this.game()?.videos?.[this.activeVideoIndex()];
    return v ? `${v.embedUrl}?autoplay=1&rel=0&modestbranding=1` : null;
  });

  readonly isFavorite = signal(false);
  readonly favoriteLoading = signal(false);

  private readonly gameService = inject(GameService);
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly toast = inject(ToastService);

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
      this._favoriteSub = this.favoritesService
        .isFavorite(user.id, Number(game.id))
        .subscribe(v => this.isFavorite.set(v));
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

  prevVideo(): void {
    const count = this.game()?.videos?.length ?? 0;
    if (count === 0) return;
    this.activeVideoIndex.set((this.activeVideoIndex() - 1 + count) % count);
  }

  nextVideo(): void {
    const count = this.game()?.videos?.length ?? 0;
    if (count === 0) return;
    this.activeVideoIndex.set((this.activeVideoIndex() + 1) % count);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (this.galleryVisible()) {
      if (e.key === 'ArrowLeft') {
        this.prevImage();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.nextImage();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.galleryVisible.set(false);
      }
    } else if (this.videoVisible()) {
      if (e.key === 'ArrowLeft') {
        this.prevVideo();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.nextVideo();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.closeVideo();
      }
    }
  }

  onGalleryVisibleChange(visible: boolean): void {
    this.galleryVisible.set(visible);
  }

  openVideo(index: number): void {
    this.activeVideoIndex.set(index);
    this.videoVisible.set(true);
  }

  onVideoVisibleChange(visible: boolean): void {
    if (!visible) {
      this.videoVisible.set(false);
      this.activeVideoIndex.set(-1);
    }
  }

  closeVideo(): void {
    this.videoVisible.set(false);
    this.activeVideoIndex.set(-1);
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

  private static readonly WEBSITE_LABELS: Record<number, string> = {
    1: 'Sitio oficial',
    2: 'Wikia',
    3: 'Wikipedia',
    4: 'Facebook',
    5: 'Twitter/X',
    6: 'Twitch',
    8: 'Instagram',
    9: 'YouTube',
    10: 'App Store',
    11: 'iPad',
    12: 'Google Play',
    13: 'Steam',
    14: 'Reddit',
    15: 'Itch.io',
    16: 'Epic Games',
    17: 'GOG',
    18: 'Discord',
  };

  websiteLabel(category: number): string {
    return GameDetailsUi.WEBSITE_LABELS[category] ?? 'Web';
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
        error: (err) => {
          console.error('[toggleFavorite] removeFavorite error', err);
          this.favoriteLoading.set(false);
          this.toast.error('No se pudo quitar de favoritos. Inténtalo de nuevo.');
        },
      });
    } else {
      this.favoritesService.addFavorite(user.id, Number(game.id)).subscribe({
        next: () => {
          this.isFavorite.set(true);
          this.favoriteLoading.set(false);
        },
        error: (err) => {
          console.error('[toggleFavorite] addFavorite error', err);
          this.favoriteLoading.set(false);
          this.toast.error('No se pudo añadir a favoritos. Inténtalo de nuevo.');
        },
      });
    }
  }
}
