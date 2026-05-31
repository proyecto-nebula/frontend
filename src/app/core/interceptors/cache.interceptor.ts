import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CacheService } from '@services/cache.service';
import { MutationService } from '@services/mutation.service';
import { tap } from 'rxjs';

/**
 * Interceptor de caché SELECTIVO y seguro:
 * 
 * SOLO cachea:
 * - GET sin user_id: /games?search=X, /games?collection=trending, /categories, /plans
 * - TTL: 5-30 minutos según tipo
 * 
 * NUNCA cachea:
 * - GET con user_id (favoritos, mi-biblioteca)
 * - POST/PUT/DELETE (mutaciones)
 * - URLs con ?cache=false
 * 
 * Mutaciones:
 * - Invalida caché local
 * - Emite evento MutationService para que admin/pages se refresquen
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
  const mutationService = inject(MutationService);

  const isGetRequest = req.method === 'GET';
  const isApiRequest = req.url.includes('/api/v1/');
  const shouldSkipCache = req.params.has('cache') && req.params.get('cache') === 'false';
  const isAdminList = req.params.has('all') && req.params.get('all') === 'true'; // NUNCA cachear listas de admin
  
  // NUNCA cachear si tiene user_id, ?all=true, o está explícitamente desactivado
  const hasUserId = req.params.has('user_id');
  if (!isApiRequest || shouldSkipCache || isAdminList) {
    return next(req);
  }

  // ========== GET sin user_id: intentar caché ==========
  if (isGetRequest && !hasUserId) {
    const cacheKey = getCacheKey(req.url, req.params);
    const cached = cacheService.get<unknown>(cacheKey);

    if (cached) {
      // Devolver inmediato desde caché, pero actualizar en background
      return next(req).pipe(
        tap(response => {
          if ((response as any)?.status !== 304) {
            cacheService.set(cacheKey, response, getTtlForUrl(req.url));
          }
        }),
      );
    }

    // No hay caché: hacer request
    return next(req).pipe(
      tap(response => {
        if ((response as any)?.status !== 304) {
          cacheService.set(cacheKey, response, getTtlForUrl(req.url));
        }
      }),
    );
  }

  // ========== POST/PUT/DELETE: Invalidar caché + emitir evento ==========
  if (!isGetRequest) {
    return next(req).pipe(
      tap(() => {
        invalidateCacheAndEmitMutation(cacheService, mutationService, req.url, req.method);
      }),
    );
  }

  // ========== GET con user_id: pass-through sin caché ==========
  return next(req);
};

function getCacheKey(url: string, params: any): string {
  const queryString = Array.from(params.keys())
    .sort()
    .map(key => `${key}=${params.get(key)}`)
    .join('&');
  return `api:${url}${queryString ? '?' + queryString : ''}`;
}

function getTtlForUrl(url: string): number {
  if (url.includes('?search=')) return 300; // Búsquedas: 5 min
  if (url.includes('?collection=')) return 600; // Colecciones: 10 min
  if (url.includes('/categories') || url.includes('/plans') || url.includes('/pegi')) return 1800; // 30 min
  if (url.includes('/studios')) return 1800; // 30 min
  return 300; // Default: 5 min
}

/**
 * Invalida caché cuando hay mutaciones y emite evento.
 * El evento notifica a componentes de admin/pages que refresquen.
 */
function invalidateCacheAndEmitMutation(
  cacheService: CacheService,
  mutationService: MutationService,
  url: string,
  method: string,
): void {
  let resourceType: string | null = null;
  let action: 'create' | 'update' | 'delete' = method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'delete';

  // Determinar qué tipo de recurso se modificó
  if (url.includes('/games')) {
    cacheService.invalidate(/^api:.*(games|search|collection)/);
    resourceType = 'games';
  } else if (url.includes('/categories')) {
    cacheService.invalidate(/^api:.*categories/);
    resourceType = 'categories';
  } else if (url.includes('/studios')) {
    cacheService.invalidate(/^api:.*studios/);
    resourceType = 'studios';
  } else if (url.includes('/plans')) {
    cacheService.invalidate(/^api:.*plans/);
    resourceType = 'plans';
  } else if (url.includes('/pegi')) {
    cacheService.invalidate(/^api:.*pegi/);
    resourceType = 'pegi';
  } else if (url.includes('/favorites')) {
    cacheService.invalidate(/^api:.*games/);
    resourceType = 'favorites';
  } else if (url.includes('/users')) {
    cacheService.invalidate(/^api:.*users/);
    resourceType = 'users';
  }

  // IMPORTANTE: Emitir evento para que admin/pages se refresquen
  if (resourceType) {
    mutationService.emitMutation(resourceType, action);
    console.debug(`[CacheInterceptor] Evento emitido: ${action} en ${resourceType}`);
  }
}
