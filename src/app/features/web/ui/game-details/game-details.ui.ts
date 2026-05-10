import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, inject, Input, OnChanges, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { SharedUiModule } from '../../../../shared/ui/ui.module';
import { GameScreenshotsUi } from '../game-screenshots/game-screenshots.ui';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule, GameScreenshotsUi, SharedUiModule],
  templateUrl: './game-details.ui.html',
})
export class GameDetailsUi implements OnChanges {
  @Input() slug!: string;

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

  private readonly gameService = inject(GameService);

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
