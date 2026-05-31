import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { Game } from '@models/game.model';
import { Observable, catchError, of } from 'rxjs';

const DEFAULT_LIMIT = 20;

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);

  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(API_ROUTES.games);
  }

  getGameBySlug(slug: string): Observable<Game> {
    return this.http.get<Game>(`${API_ROUTES.games}?slug=${encodeURIComponent(slug)}&view=detail`);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${API_ROUTES.games}?id=${id}`);
  }

  private getCollection(
    name: string,
    options: { userId?: number; limit?: number; slug?: string } = {},
  ): Observable<Game[]> {
    const params: Record<string, string> = { collection: name };
    if (options.limit != null) params['limit'] = String(options.limit);
    if (options.userId != null) params['user_id'] = String(options.userId);
    if (options.slug != null) params['slug'] = options.slug;
    return this.http.get<Game[]>(API_ROUTES.games, { params });
  }

  // Platform collections
  getRecentlyPublished(limit = DEFAULT_LIMIT) {
    return this.getCollection('recently_published', { limit });
  }
  getLatestByReleaseDate(limit = DEFAULT_LIMIT) {
    return this.getCollection('new_releases', { limit });
  }
  getTrendingToday(limit = DEFAULT_LIMIT) {
    return this.getCollection('trending_today', { limit });
  }
  getTrendingWeek(limit = DEFAULT_LIMIT) {
    return this.getCollection('trending_week', { limit });
  }
  getTrendingMonth(limit = DEFAULT_LIMIT) {
    return this.getCollection('trending_month', { limit });
  }
  getMostFavorited(limit = DEFAULT_LIMIT) {
    return this.getCollection('most_favorited', { limit });
  }

  // Per-user collections
  getFavoriteGames(userId: number) {
    return this.getCollection('favorites', { userId });
  } // sin límite → devuelve todos
  getLastPlayedGames(userId: number, limit = DEFAULT_LIMIT) {
    return this.getCollection('last_played', { userId, limit });
  }
  getMostPlayedGames(userId: number, limit = DEFAULT_LIMIT) {
    return this.getCollection('most_played_by', { userId, limit });
  }
  getRecommended(userId: number, limit = DEFAULT_LIMIT) {
    return this.getCollection('recommended', { userId, limit });
  }

  getUpcomingReleases(limit = 200) {
    return this.getCollection('upcoming_releases', { limit });
  }

  // Game-specific collections
  getSimilarGames(slug: string, limit = DEFAULT_LIMIT) {
    return this.getCollection('similar', { slug, limit });
  }
  getGamesByDeveloper(slug: string, limit = DEFAULT_LIMIT) {
    return this.getCollection('by_developer', { slug, limit });
  }

  searchGames(query: string, limit = 8): Observable<Game[]> {
    return this.http
      .get<Game[]>(API_ROUTES.games, { params: { search: query, limit: String(limit) } })
      .pipe(catchError(() => of([])));
  }
}
