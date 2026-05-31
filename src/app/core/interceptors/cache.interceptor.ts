import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MutationService } from '@services/mutation.service';
import { tap } from 'rxjs';

/**
 * Interceptor simplificado (SIN CACHÉ):
 * 
 * Solo maneja mutaciones:
 * - POST/PUT/DELETE: Emite evento MutationService para que admin/pages se refresquen
 * - Todas las GET pasan directamente al servidor sin almacenamiento en caché
 * 
 * Motivo: El caché estaba causando:
 * 1. Tablas admin no se actualizaban (datos cacheados)
 * 2. Búsqueda fallaba con "Error del servidor" (cache stale)
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const mutationService = inject(MutationService);
  const isApiRequest = req.url.includes('/api/v1/');

  // ========== POST/PUT/DELETE: Emitir evento para refrescar admin tables ==========
  if (!isApiRequest) {
    return next(req);
  }

  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(() => {
        emitMutationEvent(mutationService, req.url, req.method);
      }),
    );
  }

  // ========== GET: Pass-through directo, sin caché ==========
  return next(req);
};

/**
 * Emite evento MutationService basado en la URL y método HTTP
 */
function emitMutationEvent(
  mutationService: MutationService,
  url: string,
  method: string,
): void {
  let resourceType: string | null = null;
  let action: 'create' | 'update' | 'delete' = method === 'POST' ? 'create' : method === 'PUT' ? 'update' : 'delete';

  // Determinar qué tipo de recurso se modificó
  if (url.includes('/games')) {
    resourceType = 'games';
  } else if (url.includes('/categories')) {
    resourceType = 'categories';
  } else if (url.includes('/studios')) {
    resourceType = 'studios';
  } else if (url.includes('/plans')) {
    resourceType = 'plans';
  } else if (url.includes('/pegi')) {
    resourceType = 'pegi';
  } else if (url.includes('/favorites')) {
    resourceType = 'favorites';
  } else if (url.includes('/users')) {
    resourceType = 'users';
  } else if (url.includes('/avatars')) {
    resourceType = 'avatars';
  } else if (url.includes('/reports')) {
    resourceType = 'reports';
  }

  // Emitir evento para que admin/pages se refresquen
  if (resourceType) {
    mutationService.emitMutation(resourceType, action);
    console.debug(`[MutationInterceptor] Evento emitido: ${action} en ${resourceType}`);
  }
}
