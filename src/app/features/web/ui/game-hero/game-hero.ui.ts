import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { Game } from '@models/game.model';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { ToastService } from '@shared/ui/toast/toast.service';

@Component({
  selector: 'app-game-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent],
  templateUrl: './game-hero.ui.html',
})
export class GameHeroUi implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);

  ngOnInit(): void {
    this.doc.body.classList.add('hero');
  }

  ngOnDestroy(): void {
    this.doc.body.classList.remove('hero');
  }

  @Input() game: Game | null = null;
  /** 'detail' = game-view page; 'featured' = home featured carousel */
  @Input() mode: 'detail' | 'featured' = 'detail';
  /** Slug used for /play/:slug routing (detail mode) */
  @Input() slug = '';
  @Input() isLoggedIn = false;
  @Input() hasPlan = false;
  @Input() ageRestricted = false;
  @Input() isFavorite = false;
  @Input() favoriteLoading = false;

  @Output() favToggle = new EventEmitter<void>();

  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  // ── Share ──────────────────────────────────────────────────────
  shareVisible = false;
  linkCopied = false;

  get shareUrl(): string {
    return typeof window !== 'undefined' ? window.location.href : '';
  }
  get shareTitle(): string {
    return this.game?.title ?? '';
  }

  openShare(): void {
    this.linkCopied = false;
    this.shareVisible = true;
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch {
      /* clipboard not available */
    }
  }

  shareEmail(): void {
    window.open(
      `mailto:?subject=${encodeURIComponent('Echa un vistazo a ' + this.shareTitle + ' en Nebula')}&body=${encodeURIComponent(this.shareUrl)}`,
    );
  }
  shareFacebook(): void {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }
  shareX(): void {
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(this.shareTitle + ' en Nebula')}`,
      '_blank',
      'noopener,noreferrer',
    );
  }
  shareReddit(): void {
    window.open(
      `https://www.reddit.com/submit?url=${encodeURIComponent(this.shareUrl)}&title=${encodeURIComponent(this.shareTitle)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  // ── Report ─────────────────────────────────────────────────────
  reportVisible = false;
  reportType = 4;
  reportDesc = '';
  reportSending = signal(false);

  readonly reportTypes = [
    { value: 1, label: 'El juego no carga' },
    { value: 2, label: 'Error gráfico o visual' },
    { value: 3, label: 'Problema de audio' },
    { value: 4, label: 'Otro' },
  ];

  openReport(): void {
    this.reportType = 4;
    this.reportDesc = '';
    this.reportVisible = true;
  }

  submitReport(): void {
    if (!this.game?.id) return;
    this.reportSending.set(true);
    this.http
      .post(API_ROUTES.reports, {
        gameId: this.game.id,
        type: this.reportType,
        description: this.reportDesc || null,
      })
      .subscribe({
        next: () => {
          this.reportSending.set(false);
          this.reportVisible = false;
          this.toast.success('Reporte enviado. ¡Gracias!');
        },
        error: () => {
          this.reportSending.set(false);
          this.toast.error('No se pudo enviar el reporte.');
        },
      });
  }
}
