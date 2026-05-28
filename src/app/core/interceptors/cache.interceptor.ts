import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { API_ROUTES } from '@config/api.routes';

/**
 * Endpoints excluidos del caché — datos de autenticación o mutables por usuario.
 * Los GET al resto (games, studios, pegi, categories, plans...) sí se cachean.
 */
const NO_CACHE_PATTERNS = ['/auth', '/sessions', '/favorites', '/users', '/logs'];

/** Tiempo de vida de cada entrada (ms). */
const TTL = 30 * 1000; // 30 segundos
const PFX = 'nc_';

function getCached(key: string): unknown | null {
  try {
    const raw = sessionStorage.getItem(PFX + btoa(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as { body: unknown; exp: number };
    if (Date.now() >= entry.exp) { sessionStorage.removeItem(PFX + btoa(key)); return null; }
    return entry.body;
  } catch { return null; }
}

function setCached(key: string, body: unknown): void {
  try {
    sessionStorage.setItem(PFX + btoa(key), JSON.stringify({ body, exp: Date.now() + TTL }));
  } catch { /* quota exceeded — ignorar */ }
}

function invalidate(url: string): void {
  const base = url.split('?')[0];
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (!k?.startsWith(PFX)) continue;
    try {
      if (atob(k.slice(PFX.length)).startsWith(base)) sessionStorage.removeItem(k);
    } catch { /* ignorar */ }
  }
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Mutations: forward and invalidate cache for the affected resource on success
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          // Invalidate caches for the mutated resource
          invalidate(req.url);
          // If favorites were changed, also invalidate cached games collections
          try {
            if (req.url.includes(API_ROUTES.favorites) || req.url.includes('/favorites')) {
              invalidate(API_ROUTES.games);
              // Notify other parts of the app that favorites were mutated (after cache invalidation)
              try {
                if (typeof window !== 'undefined' && 'CustomEvent' in window) {
                  window.dispatchEvent(new CustomEvent('nebula:mutated', { detail: { resource: 'favorites' } }));
                }
              } catch { /* ignore */ }
            }
          } catch { /* ignore */ }
        }
      }),
    );
  }

  // Exclude requests containing user_id (user-specific, mutable data)
  if (req.params.has('user_id') || req.urlWithParams.includes('user_id=')) return next(req);
  if (NO_CACHE_PATTERNS.some(p => req.url.includes(p))) return next(req);

  const key = req.urlWithParams;
  const hit = getCached(key);
  if (hit !== null) {
    return of(new HttpResponse({ body: hit, status: 200 }));
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        setCached(key, event.body);
      }
    }),
  );
};
