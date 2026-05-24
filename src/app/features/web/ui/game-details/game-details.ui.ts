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
import { ToastService } from '@shared/ui/toast/toast.service';
import { SharedUiModule } from '@shared/ui/ui.module';
import { Subscription } from 'rxjs';
import { GameHeroUi } from '../game-hero/game-hero.ui';
import { GameScreenshotsUi } from '../game-screenshots/game-screenshots.ui';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterModule, GameHeroUi, GameScreenshotsUi, SharedUiModule],
  templateUrl: './game-details.ui.html',
})
export class GameDetailsUi implements OnChanges {
  @Input() slug!: string;
  @Output() gameLoaded = new EventEmitter<Game>();

  readonly game = signal<Game | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly mediaVisible = signal(false);
  readonly activeMediaIndex = signal(0);

  readonly mediaItems = computed(() => {
    const game = this.game();
    const items: ({ kind: 'screenshot'; itemImageSrc: string; alt: string } | { kind: 'video'; embedUrl: string })[] =
      [];
    const vids = game?.videos ?? [];
    if (vids.length > 0) {
      const trailerIdx = vids.findIndex(v => v.name && v.name.toLowerCase().includes('trailer'));
      const chosen = vids[trailerIdx >= 0 ? trailerIdx : 0];
      items.push({ kind: 'video', embedUrl: `${chosen.embedUrl}?autoplay=1&rel=0&modestbranding=1` });
    }
    (game?.screenshots ?? []).forEach((s, i) =>
      items.push({ kind: 'screenshot', itemImageSrc: s.imageUrl, alt: `${game?.title ?? 'Screenshot'} ${i + 1}` }),
    );
    return items;
  });

  readonly activeMediaItem = computed(() => this.mediaItems()[this.activeMediaIndex()] ?? null);
  readonly activeGallerySrc = computed(() => {
    const item = this.activeMediaItem();
    return item?.kind === 'screenshot' ? item.itemImageSrc : null;
  });
  readonly activeGalleryAlt = computed(() => {
    const item = this.activeMediaItem();
    return item?.kind === 'screenshot' ? item.alt : '';
  });
  readonly activeEmbedUrl = computed(() => {
    const item = this.activeMediaItem();
    return item?.kind === 'video' ? item.embedUrl : null;
  });

  readonly descriptionParagraphs = computed(() => {
    const desc = this.game()?.description ?? this.game()?.summary ?? '';
    return desc
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
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

  openMediaItem(event: { type: 'screenshot' | 'video'; index: number }): void {
    const items = this.mediaItems();
    let targetIndex: number;
    if (event.type === 'video') {
      targetIndex = 0;
    } else {
      const hasVideo = items.length > 0 && items[0].kind === 'video';
      targetIndex = hasVideo ? event.index + 1 : event.index;
    }
    this.activeMediaIndex.set(Math.max(0, Math.min(targetIndex, items.length - 1)));
    this.mediaVisible.set(true);
  }

  prevMedia(): void {
    const count = this.mediaItems().length;
    if (count === 0) return;
    this.activeMediaIndex.set((this.activeMediaIndex() - 1 + count) % count);
  }

  nextMedia(): void {
    const count = this.mediaItems().length;
    if (count === 0) return;
    this.activeMediaIndex.set((this.activeMediaIndex() + 1) % count);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (this.mediaVisible()) {
      if (e.key === 'ArrowLeft') {
        this.prevMedia();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        this.nextMedia();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        this.mediaVisible.set(false);
      }
    }
  }

  onMediaVisibleChange(visible: boolean): void {
    this.mediaVisible.set(visible);
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
    22: 'Xbox',
    23: 'PlayStation',
    24: 'Nintendo',
  };

  private static readonly PLATFORM_TYPES = new Set([13, 16, 17, 22, 23, 24]);

  readonly platformSites = computed(() =>
    (this.game()?.websites ?? []).filter(s => GameDetailsUi.PLATFORM_TYPES.has(s.type)),
  );

  readonly otherSites = computed(() =>
    (this.game()?.websites ?? []).filter(s => !GameDetailsUi.PLATFORM_TYPES.has(s.type)),
  );

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
        error: err => {
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
        error: err => {
          console.error('[toggleFavorite] addFavorite error', err);
          this.favoriteLoading.set(false);
          this.toast.error('No se pudo añadir a favoritos. Inténtalo de nuevo.');
        },
      });
    }
  }
}
