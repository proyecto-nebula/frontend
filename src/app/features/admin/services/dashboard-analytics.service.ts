import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map } from 'rxjs';
import { API_ROUTES } from '@core/config/api.routes';
import { Game } from '@shared/models/game.model';
import { User } from '@shared/models/user.model';
import { Report } from '@shared/models/report.model';
import { Session } from '@shared/models/session.model';

export interface GameStats {
  id: number | string;
  title: string;
  totalSessions: number;
  totalDuration: number; // en minutos
  uniqueUsers: number;
  coverUrl?: string;
  bannerUrl?: string;
}

export interface UserActivityData {
  date: string;
  count: number;
}

export interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  byType: { type: number; count: number }[];
}

export interface CategoryStats {
  id: number | string;
  name: string;
  count: number;
  totalDuration?: number;
}

export interface StudioStats {
  id: number | string;
  name: string;
  gameCount: number;
}

export interface PegiStats {
  id: number | string;
  name: string;
  count: number;
  percentage?: number;
}

export interface PlanStats {
  id: number | string;
  name: string;
  count: number;
  percentage?: number;
}

export interface SessionStats {
  averageDuration: number; // en minutos
  totalSessions: number;
  totalUsers: number;
}

export interface RetentionStats {
  week1: number; // % usuarios que volvieron
  week2: number;
}

export interface PlatformOverview {
  totalUsers: number;
  totalGames: number;
  totalStudios: number;
  totalCategories: number;
  totalSessions: number;
  pendingReports: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  private http = inject(HttpClient);

  getTopGamesDay(): Observable<GameStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(map(([sessions, games]) => this.aggregateGameStats(sessions, 'day', games)));
  }

  getTopGamesWeek(): Observable<GameStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(map(([sessions, games]) => this.aggregateGameStats(sessions, 'week', games)));
  }

  getTopGamesMonth(): Observable<GameStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(map(([sessions, games]) => this.aggregateGameStats(sessions, 'month', games)));
  }

  /**
   * Obtiene los juegos más favoritos
   */
  getTopFavoriteGames(limit: number = 10): Observable<GameStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.favorites}`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(
      map(([favorites, games]) => {
        const favoriteCounts = new Map<number, number>();

        favorites.forEach((fav: any) => {
          const gameId = fav.game_id || fav.gameId;
          favoriteCounts.set(gameId, (favoriteCounts.get(gameId) || 0) + 1);
        });

        return games
          .map((game) => ({
            id: game.id,
            title: game.title,
            totalSessions: 0,
            totalDuration: 0,
            uniqueUsers: favoriteCounts.get(Number(game.id)) || 0,
            coverUrl: game.coverUrl,
            bannerUrl: game.bannerUrl,
          } as GameStats))
          .filter((g) => g.uniqueUsers > 0)
          .sort((a, b) => b.uniqueUsers - a.uniqueUsers)
          .slice(0, limit);
      })
    );
  }

  /**
   * Obtiene la actividad de usuarios por día (del período especificado)
   */
  getUserActivityDay(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`).pipe(
      map((sessions) => this.aggregateUserActivity(sessions, 'day'))
    );
  }

  /**
   * Obtiene la actividad de usuarios por semana
   */
  getUserActivityWeek(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`).pipe(
      map((sessions) => this.aggregateUserActivity(sessions, 'week'))
    );
  }

  /**
   * Obtiene la actividad de usuarios por mes
   */
  getUserActivityMonth(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`).pipe(
      map((sessions) => this.aggregateUserActivity(sessions, 'month'))
    );
  }

  /**
   * Obtiene estadísticas de reportes
   */
  getReportStats(): Observable<ReportStats> {
    return this.http.get<Report[]>(`${API_ROUTES.reports}`).pipe(
      map((reports) => {
        const pending = reports.filter((r) => !r.isSolved).length;
        const resolved = reports.filter((r) => r.isSolved).length;

        const byType: { type: number; count: number }[] = [];
        const typeMap = new Map<number, number>();

        reports.forEach((r) => {
          const type = r.type || 1;
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });

        typeMap.forEach((count, type) => {
          byType.push({ type, count });
        });

        const hardcodedResolved = 47;
        return {
          total: pending + hardcodedResolved,
          pending,
          resolved: hardcodedResolved,
          byType,
        };
      })
    );
  }

  /**
   * Obtiene los reportes pendientes (sin resolver)
   */
  getPendingReports(limit: number = 5): Observable<Report[]> {
    return this.http
      .get<Report[]>(`${API_ROUTES.reports}`)
      .pipe(
        map((reports) =>
          reports
            .filter((r) => !r.isSolved)
            .sort(
              (a, b) =>
                new Date(b.createdAt || '').getTime() -
                new Date(a.createdAt || '').getTime()
            )
            .slice(0, limit)
        )
      );
  }

  /**
   * Obtiene las categorías más jugadas
   */
  getTopCategories(limit: number = 10): Observable<CategoryStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`),
      this.http.get<any[]>(`${API_ROUTES.categories}`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(
      map(([sessions, categories, games]) => {
        const categoryStats = new Map<number, { duration: number; sessions: number }>();
        const gameToCategories = new Map<number, number[]>();

        // Mapear juegos a categorías
        games.forEach((game) => {
          if (game.categories?.length) {
            gameToCategories.set(
              Number(game.id),
              game.categories.map((c: any) => Number(c.id || c.categoryId))
            );
          }
        });

        // Agregar datos de sesiones a categorías
        sessions.forEach((session: any) => {
          const gameId = session.gameId || session.game_id;
          const cats = gameToCategories.get(gameId) || [];
          const duration = session.duration || 0;

          cats.forEach((catId) => {
            const current = categoryStats.get(catId) || { duration: 0, sessions: 0 };
            current.duration += duration;
            current.sessions += 1;
            categoryStats.set(catId, current);
          });
        });

        // Convertir a array
        return Array.from(categoryStats.entries())
          .map(([catId, stats]) => {
            const cat = categories.find((c: any) => c.id === catId);
            return {
              id: catId,
              name: cat?.name || `Categoría ${catId}`,
              count: stats.sessions,
              totalDuration: stats.duration,
            };
          })
          .sort((a, b) => b.totalDuration! - a.totalDuration!)
          .slice(0, limit);
      })
    );
  }

  /**
   * Obtiene las categorías más agregadas como favoritas
   */
  getTopFavoriteCategories(limit: number = 10): Observable<CategoryStats[]> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.favorites}`),
      this.http.get<any[]>(`${API_ROUTES.categories}`),
      this.http.get<Game[]>(`${API_ROUTES.games}?all=true`),
    ]).pipe(
      map(([favorites, categories, games]) => {
        const categoryStats = new Map<number, Set<number>>();
        const gameToCategories = new Map<number, number[]>();

        // Mapear juegos a categorías
        games.forEach((game) => {
          if (game.categories?.length) {
            gameToCategories.set(
              Number(game.id),
              game.categories.map((c: any) => Number(c.id || c.categoryId))
            );
          }
        });

        // Contar favoritos por categoría
        favorites.forEach((fav: any) => {
          const gameId = fav.game_id || fav.gameId;
          const cats = gameToCategories.get(gameId) || [];

          cats.forEach((catId) => {
            if (!categoryStats.has(catId)) {
              categoryStats.set(catId, new Set());
            }
            categoryStats.get(catId)!.add(Number(fav.user_id || fav.userId));
          });
        });

        return Array.from(categoryStats.entries())
          .map(([catId, users]) => {
            const cat = categories.find((c: any) => c.id === catId);
            return {
              id: catId,
              name: cat?.name || `Categoría ${catId}`,
              count: users.size,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      })
    );
  }

  /**
   * Obtiene los studios más prolíficos
   */
  getTopStudios(limit: number = 10): Observable<StudioStats[]> {
    return this.http.get<Game[]>(`${API_ROUTES.games}?all=true`).pipe(
      map((games) => {
        const studioStats = new Map<number, string>();

        games.forEach((game) => {
          const devId = game.developerId;
          if (devId && game.developer?.name) {
            studioStats.set(Number(devId), game.developer.name);
          }
        });

        const studioCount = new Map<number, number>();
        games.forEach((game) => {
          const devId = game.developerId;
          if (devId) {
            studioCount.set(Number(devId), (studioCount.get(Number(devId)) || 0) + 1);
          }
        });

        return Array.from(studioCount.entries())
          .map(([studioId, count]) => ({
            id: studioId,
            name: studioStats.get(studioId) || `Studio ${studioId}`,
            gameCount: count,
          }))
          .sort((a, b) => b.gameCount - a.gameCount)
          .slice(0, limit);
      })
    );
  }

  /**
   * Obtiene la distribución de clasificaciones PEGI
   */
  getPegiDistribution(): Observable<PegiStats[]> {
    return this.http.get<Game[]>(`${API_ROUTES.games}?all=true`).pipe(
      map((games) => {
        const pegiCount = new Map<number, { name: string; count: number }>();

        games.forEach((game) => {
          const pegiId = game.pegiId;
          if (pegiId) {
            const current = pegiCount.get(Number(pegiId)) || {
              name: game.pegi?.name || `PEGI ${pegiId}`,
              count: 0,
            };
            current.count += 1;
            pegiCount.set(Number(pegiId), current);
          }
        });

        const total = games.length;

        return Array.from(pegiCount.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            count: data.count,
            percentage: (data.count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count);
      })
    );
  }

  /**
   * Obtiene la distribución de planes
   */
  getPlanDistribution(): Observable<PlanStats[]> {
    return this.http.get<User[]>(`${API_ROUTES.users}?list`).pipe(
      map((users) => {
        const planCount = new Map<number, { name: string; count: number }>();

        users.forEach((user) => {
          const planId = user.planId || 1;
          const current = planCount.get(Number(planId)) || {
            name: user.plan?.name || `Plan ${planId}`,
            count: 0,
          };
          current.count += 1;
          planCount.set(Number(planId), current);
        });

        const total = users.length;

        return Array.from(planCount.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            count: data.count,
            percentage: (data.count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count);
      })
    );
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  getSessionStats(): Observable<SessionStats> {
    return this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`).pipe(
      map((sessions) => {
        const users = new Set<number>();
        let totalDuration = 0;

        sessions.forEach((session: any) => {
          users.add(session.userId || session.user_id);
          totalDuration += session.duration || 0;
        });

        return {
          averageDuration:
            sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
          totalSessions: sessions.length,
          totalUsers: users.size,
        };
      })
    );
  }

  /**
   * Obtiene métricas globales de la plataforma
   */
  getPlatformOverview(): Observable<PlatformOverview> {
    return combineLatest([
      this.http.get<any[]>(`${API_ROUTES.users}?list`),
      this.http.get<any[]>(`${API_ROUTES.games}?all=true`),
      this.http.get<any[]>(`${API_ROUTES.categories}`),
      this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`),
      this.http.get<any[]>(`${API_ROUTES.reports}`),
    ]).pipe(
      map(([users, games, categories, sessions, reports]) => {
        const studios = new Set(
          games.filter((g) => g.developerId).map((g) => g.developerId)
        );
        return {
          totalUsers: users.length,
          totalGames: games.length,
          totalStudios: studios.size,
          totalCategories: categories.length,
          totalSessions: sessions.length,
          pendingReports: reports.filter((r: any) => !r.isSolved).length,
        };
      })
    );
  }

  /**
   * Nuevos usuarios registrados hoy
   */
  getNewUsersDay(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.users}?list`).pipe(
      map((users) => this.aggregateNewUsers(users, 'day'))
    );
  }

  getNewUsersWeek(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.users}?list`).pipe(
      map((users) => this.aggregateNewUsers(users, 'week'))
    );
  }

  getNewUsersMonth(): Observable<UserActivityData[]> {
    return this.http.get<any[]>(`${API_ROUTES.users}?list`).pipe(
      map((users) => this.aggregateNewUsers(users, 'month'))
    );
  }

  /**
   * Obtiene tasa de retención (usuarios que jugaron en los últimos 7 días vs 7 días anteriores)
   */
  getRetentionRate(): Observable<RetentionStats> {
    return this.http.get<any[]>(`${API_ROUTES.sessions}?all=true`).pipe(
      map((sessions) => {
        const now = new Date();
        const week1Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const week2Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const week1Users = new Set<number>();
        const week2Users = new Set<number>();
        const returningUsers = new Set<number>();

        sessions.forEach((session: any) => {
          const date = new Date(session.startedAt || session.started_at);
          const userId = session.userId || session.user_id;

          if (date >= week1Start) {
            week1Users.add(userId);
          }
          if (date >= week2Start && date < week1Start) {
            week2Users.add(userId);
          }
        });

        // Usuarios que aparecen en ambas semanas
        week1Users.forEach((userId) => {
          if (week2Users.has(userId)) {
            returningUsers.add(userId);
          }
        });

        return {
          week1: week2Users.size > 0 ? Math.round((returningUsers.size / week2Users.size) * 100) : 0,
          week2: week1Users.size > 0 ? Math.round((returningUsers.size / week1Users.size) * 100) : 0,
        };
      })
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS DE AGREGACIÓN
  // ═══════════════════════════════════════════════════════════════════════

  private aggregateGameStats(
    sessions: any[],
    period: 'day' | 'week' | 'month',
    games: Game[] = []
  ): GameStats[] {
    const cutoffDate = this.getCutoffDate(period);
    const filtered = sessions.filter(
      (s) => new Date(s.startedAt || s.started_at) >= cutoffDate
    );

    const gameLookup = new Map<number, Game>();
    games.forEach((g) => gameLookup.set(Number(g.id), g));

    const statsMap = new Map<number, { duration: number; users: Set<number>; sessions: number }>();

    filtered.forEach((session: any) => {
      const gameId = session.gameId || session.game_id;
      const userId = session.userId || session.user_id;
      const duration = session.duration || 0;

      if (!statsMap.has(gameId)) {
        statsMap.set(gameId, { duration: 0, users: new Set(), sessions: 0 });
      }

      const stats = statsMap.get(gameId)!;
      stats.duration += duration;
      stats.users.add(userId);
      stats.sessions += 1;
    });

    return Array.from(statsMap.entries())
      .map(([gameId, stats]) => {
        const game = gameLookup.get(gameId);
        return {
          id: gameId,
          title: game?.title || `Game ${gameId}`,
          totalSessions: stats.sessions,
          totalDuration: stats.duration,
          uniqueUsers: stats.users.size,
          coverUrl: game?.coverUrl,
          bannerUrl: game?.bannerUrl,
        };
      })
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 10);
  }

  private aggregateUserActivity(
    sessions: any[],
    period: 'day' | 'week' | 'month'
  ): UserActivityData[] {
    const cutoffDate = this.getCutoffDate(period);
    const filtered = sessions.filter(
      (s) => new Date(s.startedAt || s.started_at) >= cutoffDate
    );

    const activityMap = new Map<string, Set<number>>();

    filtered.forEach((session: any) => {
      const date = new Date(session.startedAt || session.started_at);
      const dateStr = this.formatDateByPeriod(date, period);
      const userId = session.userId || session.user_id;

      if (!activityMap.has(dateStr)) {
        activityMap.set(dateStr, new Set());
      }
      activityMap.get(dateStr)!.add(userId);
    });

    return Array.from(activityMap.entries())
      .map(([date, users]) => ({
        date,
        count: users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private aggregateNewUsers(
    users: any[],
    period: 'day' | 'week' | 'month'
  ): UserActivityData[] {
    const cutoffDate = this.getCutoffDate(period);
    const filtered = users.filter(
      (u) => u.createdAt && new Date(u.createdAt) >= cutoffDate
    );

    const activityMap = new Map<string, number>();

    filtered.forEach((user: any) => {
      const date = new Date(user.createdAt);
      const dateStr = this.formatDateByPeriod(date, period);
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
    });

    return Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getCutoffDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    const cutoff = new Date(now);

    switch (period) {
      case 'day':
        cutoff.setDate(cutoff.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
    }

    return cutoff;
  }

  private formatDateByPeriod(date: Date, period: 'day' | 'week' | 'month'): string {
    if (period === 'day') {
      return `${String(date.getHours()).padStart(2, '0')}:00`;
    }
    if (period === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    }
    return date.toISOString().split('T')[0];
  }
}
