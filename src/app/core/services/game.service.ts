import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { Game } from '@models/game.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(API_ROUTES.games);
  }

  // No mapping or extraction needed since backend matches Game interface

  getGameBySlug(slug: string): Observable<Game> {
    return this.http.get<Game>(`${API_ROUTES.games}?slug=${encodeURIComponent(slug)}`);
  }
}
