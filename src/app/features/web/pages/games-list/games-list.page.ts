import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Game } from '@models/game.model';
import { GameService } from '@services/game.service';
import { catchError, finalize, of, retry } from 'rxjs';
import { GamesListComponent } from '../../components/games-list/games-list';

@Component({
  selector: 'app-games-list-page',
  standalone: true,
  imports: [CommonModule, GamesListComponent],
  templateUrl: './games-list.page.html',
  styleUrls: ['./games-list.page.scss'],
})
export class GamesListPage {
  protected readonly games = signal<Game[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  private readonly gameService = inject(GameService);

  constructor() {
    this.loadGames();
  }

  private loadGames(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.gameService
      .getGames()
      .pipe(
        retry({ count: 1, delay: 250 }),
        catchError(err => {
          this.errorMessage.set(err?.message ?? 'No se pudo cargar el listado de juegos');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((games: Game[]) => {
        this.games.set(games);
      });
  }
}
