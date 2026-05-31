import { Injectable } from '@angular/core';

/**
 * Caché en memoria con TTL para búsquedas y datos frecuentes.
 * Garantiza consistencia evitando datos stale sin bloquear actualizaciones.
 * 
 * Estrategia:
 * - Búsquedas: 5 minutos (user puede ver datos de hace 5min en search)
 * - Colecciones: 10 minutos (trending, recientes, etc.)
 * - User data: 2 minutos (favoritos, último jugado)
 * - Invalidación automática: on logout, on mutations
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  hits: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private subscriptions = new Map<string, Set<() => void>>();

  /**
   * Obtiene valor del caché si es válido, null si expiró o no existe.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  /**
   * Guarda en caché con TTL en segundos.
   * Emite notificación de cambio a suscriptores.
   */
  set<T>(key: string, data: T, ttlSeconds = 300): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      hits: 0,
    });
    this.notifySubscribers(key);
  }

  /**
   * Invalida todas las entradas que coincidan con patrón regex.
   * Usado para limpiar grupos de caché relacionados.
   * 
   * Ejemplo:
   * - invalidate(/^search_/) → elimina todos los search_*
   * - invalidate(/^trending|^favorites/) → limpia trending y favoritos
   */
  invalidate(pattern: RegExp | string): number {
    if (typeof pattern === 'string') {
      const had = this.cache.has(pattern);
      this.cache.delete(pattern);
      this.notifySubscribers(pattern);
      return had ? 1 : 0;
    }

    let count = 0;
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
        count++;
      }
    });
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.notifySubscribers(key);
    });
    return count;
  }

  /**
   * Limpia TODO el caché. Usado en logout.
   */
  clear(): void {
    this.cache.clear();
    this.subscriptions.forEach(subscribers => subscribers.forEach(cb => cb()));
  }

  /**
   * Obtiene estadísticas del caché (para debugging).
   */
  getStats() {
    let totalHits = 0;
    let validEntries = 0;
    this.cache.forEach(entry => {
      totalHits += entry.hits;
      if (entry.expiresAt > Date.now()) validEntries++;
    });
    return {
      totalEntries: this.cache.size,
      validEntries,
      totalHits,
      hitRate: this.cache.size > 0 ? (totalHits / this.cache.size).toFixed(2) : 0,
    };
  }

  /**
   * Se ejecuta cuando un caché es invalidado.
   * Usado por servicios para saber cuándo refrescar.
   */
  onInvalidation(key: string | RegExp, callback: () => void): () => void {
    if (!this.subscriptions.has(key.toString())) {
      this.subscriptions.set(key.toString(), new Set());
    }
    this.subscriptions.get(key.toString())!.add(callback);

    // Retorna función para desuscribirse
    return () => {
      this.subscriptions.get(key.toString())?.delete(callback);
    };
  }

  private notifySubscribers(key: string): void {
    this.subscriptions.forEach((subscribers, pattern) => {
      if (new RegExp(pattern).test(key)) {
        subscribers.forEach(cb => cb());
      }
    });
  }
}
