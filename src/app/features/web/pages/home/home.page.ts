import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, take } from 'rxjs/operators';
import { Game } from '@models/game.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { GameFeaturedUi } from '@web/ui/game-featured/game-featured.ui';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';
import { WebRegistrationSuccessUi } from '@web/ui/registration-success/registration-success.ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameFeaturedUi, GameCollectionUi, WebRegistrationSuccessUi],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  private route = inject(ActivatedRoute);
  private gameService = inject(GameService);
  readonly authService = inject(AuthService);
  private title = inject(Title);

  showSuccess = false;
  successUsername?: string | null = null;
  successPlanName?: string | null = null;

  readonly recentlyPublished  = signal<Game[] | null>(null);
  readonly latestByReleaseDate = signal<Game[] | null>(null);
  readonly trendingToday       = signal<Game[] | null>(null);
  readonly trendingWeek        = signal<Game[] | null>(null);
  readonly trendingMonth       = signal<Game[] | null>(null);
  readonly mostFavorited       = signal<Game[] | null>(null);
  readonly recommended         = signal<Game[] | null>(null);

  ngOnInit(): void {
    this.title.setTitle('Inicio — Nebula');
    const qp = this.route.snapshot.queryParamMap;
    if (qp.has('registered')) {
      this.showSuccess = true;
      this.successUsername = qp.get('username');
      this.successPlanName = qp.get('planName');
    } else if (qp.has('planChanged')) {
      this.showSuccess = true;
      this.successUsername = 'Plan actualizado';
      this.successPlanName = qp.get('planName');
    }

    this.gameService.getRecentlyPublished().subscribe(g => this.recentlyPublished.set(g));
    this.gameService.getLatestByReleaseDate().subscribe(g => this.latestByReleaseDate.set(g));
    this.gameService.getTrendingToday().subscribe(g => this.trendingToday.set(g));
    this.gameService.getTrendingWeek().subscribe(g => this.trendingWeek.set(g));
    this.gameService.getTrendingMonth().subscribe(g => this.trendingMonth.set(g));
    this.gameService.getMostFavorited().subscribe(g => this.mostFavorited.set(g));

    this.authService.user$.pipe(filter(u => !!u), take(1)).subscribe(user => {
      this.gameService.getRecommended(user!.id).subscribe(g => this.recommended.set(g));
    });
  }
}
