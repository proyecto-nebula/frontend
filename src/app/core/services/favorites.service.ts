import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { Observable, catchError, map, of } from 'rxjs';

export interface FavoriteEntry {
  userId: number;
  gameId: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);

  isFavorite(userId: number, gameId: number): Observable<boolean> {
    return this.http
      .get<any>(`${API_ROUTES.favorites}?user_id=${userId}&game_id=${gameId}`)
      .pipe(
        map(res => !!res),
        catchError(() => of(false)),
      );
  }

  addFavorite(userId: number, gameId: number): Observable<any> {
    return this.http.post(API_ROUTES.favorites, { user_id: userId, game_id: gameId });
  }

  removeFavorite(gameId: number): Observable<any> {
    return this.http.delete(`${API_ROUTES.favorites}/${gameId}`);
  }

  getFavoritesByUser(userId: number): Observable<FavoriteEntry[]> {
    return this.http
      .get<FavoriteEntry[]>(`${API_ROUTES.favorites}?user_id=${userId}`)
      .pipe(catchError(() => of([])));
  }
}
