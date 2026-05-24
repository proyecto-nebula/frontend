import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { SessionsService } from '@services/sessions.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-play-game-page',
  standalone: true,
  imports: [SafePipe],
  template: `
    @if (embedUrl()) {
      <iframe
        class="play-iframe"
        [src]="embedUrl()! | safe: 'resourceUrl'"
        frameborder="0"
        allow="autoplay; fullscreen; accelerometer; gyroscope; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>
    } @else if (!loading()) {
      <div class="play-no-video">
        <p>No hay vídeo disponible para este juego.</p>
      </div>
    }
  `,
})
export class PlayGamePage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);
  private readonly sessionsService = inject(SessionsService);
  private readonly document = inject(DOCUMENT);

  readonly game = signal<Game | null>(null);
  readonly loading = signal(true);

  readonly embedUrl = computed(() => {
    const videos = this.game()?.videos;
    if (!videos?.length) return null;
    const video = videos.find(v => v.name?.toLowerCase().includes('gameplay')) ?? videos[0];
    return `${video.embedUrl}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3`;
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (slug) {
      this.gameService.getGameBySlug(slug).subscribe({
        next: g => {
          this.game.set(g);
          this.loading.set(false);
          if (g?.id) {
            this.sessionsService.createSession(Number(g.id)).subscribe();
          }
        },
        error: () => this.loading.set(false),
      });
    }
    this.document.documentElement.requestFullscreen?.().catch(() => {});
  }

  ngOnDestroy(): void {
    if (this.document.fullscreenElement) {
      this.document.exitFullscreen?.().catch(() => {});
    }
  }
}
