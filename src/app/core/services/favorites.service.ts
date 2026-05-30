import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { Observable, Subject, catchError, map, of, tap } from 'rxjs';

export interface FavoriteEntry {
  userId: number;
  gameId: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);

  /** Emits whenever a favorite is added or removed. */
  readonly changed$ = new Subject<void>();
  constructor() {
    // Listen for global mutation events emitted by the cache interceptor so we
    // notify subscribers only after the cache has been invalidated.
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('nebula:mutated', (ev: Event) => {
        try {
          const e = ev as CustomEvent;
          if (e?.detail?.resource === 'favorites') this.changed$.next();
        } catch {
          /* ignore */
        }
      });
    }
  }

  isFavorite(userId: number, gameId: number): Observable<boolean> {
    return this.http
      .get<any>(`${API_ROUTES.favorites}?user_id=${userId}&game_id=${gameId}`)
      .pipe(
        map(res => !!res),
        catchError(() => of(false)),
      );
  }

  addFavorite(userId: number, gameId: number): Observable<any> {
    return this.http.post(API_ROUTES.favorites, { user_id: userId, game_id: gameId }).pipe(
      tap(() => { this.changed$.next(); this.invalidateSwCache(); }),
    );
  }

  removeFavorite(gameId: number): Observable<any> {
    return this.http.delete(`${API_ROUTES.favorites}/${gameId}`).pipe(
      tap(() => { this.changed$.next(); this.invalidateSwCache(); }),
    );
  }

  getFavoritesByUser(userId: number): Observable<FavoriteEntry[]> {
    return this.http
      .get<FavoriteEntry[]>(`${API_ROUTES.favorites}?user_id=${userId}`)
      .pipe(catchError(() => of([])));
  }

  /**
   * Borra las entradas de datos del Service Worker para evitar que sirva
   * respuestas antiguas de la API tras añadir/quitar un favorito.
   * Solo elimina caches de datos (ngsw:db:*), no los de assets estáticos.
   */
  private invalidateSwCache(): void {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key =>
          key.startsWith('ngsw:db:') ? caches.delete(key) : Promise.resolve(false),
        ),
      ),
    );
  }
}
