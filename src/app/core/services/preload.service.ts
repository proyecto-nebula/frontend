import { Injectable, inject } from '@angular/core';
import { GameService } from './game.service';
import { CategoriesService } from './categories.service';
import { PlansService } from './plans.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import { forkJoin } from 'rxjs';

/**
 * Servicio que pre-carga datos críticos en background.
 * Se ejecuta al startup de la app para llenar caché sin bloquear.
 * 
 * Datos pre-cargados:
 * - Categories (referencias globales)
 * - Plans (información de suscripción)
 * - Trending Today (colección principal)
 * 
 * IMPORTANTE: Estos datos se invalidan automáticamente al hacer POST/PUT/DELETE
 * gracias al interceptor y CacheInvalidationService.
 */
@Injectable({ providedIn: 'root' })
export class PreloadService {
  private gameService = inject(GameService);
  private categoriesService = inject(CategoriesService);
  private plansService = inject(PlansService);
  private invalidation = inject(CacheInvalidationService);

  /**
   * Pre-carga datos críticos sin bloquear.
   * Se ejecuta desde app.config.ts con APP_INITIALIZER.
   */
  preloadCriticalData(): Promise<void> {
    return new Promise(resolve => {
      // Ejecutar en background (no necesita esperar)
      forkJoin([
        this.categoriesService.getCategories().catch(() => []),
        this.plansService.getPlans().catch(() => []),
        this.gameService.getTrendingToday(12).catch(() => []),
      ]).subscribe(
        () => {
          console.log('[Preload] Datos críticos cargados en caché');
          resolve();
        },
        err => {
          console.warn('[Preload] Error cargando datos:', err);
          resolve(); // No fallar la app si el preload falla
        },
      );
    });
  }

  /**
   * Pre-carga datos personalizados del usuario después de login.
   * Se llama desde AuthService.login().
   */
  preloadUserData(userId: number): void {
    // Cargar datos del usuario de forma asíncrona
    setTimeout(() => {
      forkJoin([
        this.gameService.getFavoriteGames(userId).catch(() => []),
        this.gameService.getLastPlayedGames(userId, 10).catch(() => []),
      ]).subscribe(
        () => console.log('[Preload] Datos de usuario cargados'),
        err => console.warn('[Preload] Error cargando datos de usuario:', err),
      );
    }, 100);
  }

  /**
   * Invalida caché personalizado al logout.
   */
  onLogout(): void {
    this.invalidation.invalidateData('users', 'all');
    this.invalidation.invalidateData('favorites', 'all');
    this.invalidation.invalidateData('sessions', 'all');
  }
}
