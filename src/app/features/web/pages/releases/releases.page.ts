import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';

export interface ReleaseGroup {
  monthLabel: string;  // e.g. "Junio 2026"
  games: (Game & { dayLabel: string })[];
}

const ES_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const ES_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-releases-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './releases.page.html',
})
export class ReleasesPage {
  private gameService = inject(GameService);

  readonly isLoading = signal(true);
  readonly games = signal<Game[]>([]);

  readonly groups = computed<ReleaseGroup[]>(() => {
    const grouped = new Map<string, ReleaseGroup>();
    for (const game of this.games()) {
      if (!game.releaseDate) continue;
      const date = new Date(game.releaseDate);
      if (isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = `${ES_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
      if (!grouped.has(key)) {
        grouped.set(key, { monthLabel, games: [] });
      }
      const dayName = ES_DAYS[date.getDay()];
      const dayNum = date.getDate();
      grouped.get(key)!.games.push({ ...game, dayLabel: `${dayName} ${dayNum}` });
    }
    return Array.from(grouped.values());
  });

  constructor() {
    inject(Title).setTitle('Próximos lanzamientos — Nebula');
    this.gameService.getUpcomingReleases().subscribe(games => {
      this.games.set(games);
      this.isLoading.set(false);
    });
  }
}
