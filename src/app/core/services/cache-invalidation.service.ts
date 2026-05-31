import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Sistema de invalidación centralizado para caché.
 * 
 * GARANTÍA DE CONSISTENCIA:
 * - Cuando un POST/PUT/DELETE completa, emite evento de invalidación
 * - Los servicios se suscriben y limpian su caché automáticamente
 * - Las tablas de admin reciben notificación sin perder sesión
 * 
 * USO:
 * - Subscriptores: invalidated$.subscribe(() => refrescar datos)
 * - Emit: invalidateData('games') al actualizar juego
 * - Pattern: invalidateData('games:*') limpia todo lo de games
 */
type DataType = 'games' | 'categories' | 'favorites' | 'users' | 'plans' | 'studios' | 'screenshots' | 'avatars' | 'sessions';

@Injectable({ providedIn: 'root' })
export class CacheInvalidationService {
  /**
   * Observable que emite cuando caché debe invalidarse.
   * Payload: { type: 'games' | 'categories' | ..., scope?: 'specific' | 'all' }
   */
  readonly invalidated$ = new Subject<{ type: DataType; scope?: 'specific' | 'all'; id?: number }>();

  /**
   * Emitir para invalidar caché de un tipo de dato.
   * 
   * @param type Tipo de dato que cambió (games, favorites, etc.)
   * @param scope 'specific' = solo ese tipo, 'all' = también colecciones relacionadas
   * @param id ID del recurso modificado (opcional)
   * 
   * Ejemplos:
   * - invalidateData('games', 'specific') → solo caché de búsqueda/detalle de games
   * - invalidateData('favorites', 'all') → favoritos + trending + recientes (dependen de favoritos)
   * - invalidateData('games', 'all') → limpia TODO (trending, favoritos, recomendados, etc.)
   */
  invalidateData(type: DataType, scope: 'specific' | 'all' = 'specific', id?: number): void {
    this.invalidated$.next({ type, scope, id });
  }

  /**
   * Relaciones de caché: qué debe invalidarse cuando cambia X
   */
  private static readonly CACHE_DEPENDENCIES: Record<DataType, DataType[]> = {
    games: ['categories', 'studios', 'screenshots'],
    categories: ['games'],
    favorites: ['games'],
    users: ['sessions'],
    plans: [],
    studios: ['games'],
    screenshots: ['games'],
    avatars: ['users'],
    sessions: ['users'],
  };

  /**
   * Obtiene todas las dependencias de caché para limpiar cascada.
   */
  getCascadeDependencies(type: DataType): DataType[] {
    return [type, ...CacheInvalidationService.CACHE_DEPENDENCIES[type]];
  }
}
