import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

/**
 * Endpoints excluidos del caché — datos de autenticación o mutables por usuario.
 * Los GET al resto (games, studios, pegi, categories, plans...) sí se cachean.
 */
const NO_CACHE_PATTERNS = ['/auth', '/sessions', '/favorites', '/users'];

/** Tiempo de vida de cada entrada (ms). */
const TTL = 5 * 60 * 1000; // 5 minutos

const store = new Map<string, { body: unknown; exp: number }>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);
  if (NO_CACHE_PATTERNS.some(p => req.url.includes(p))) return next(req);

  const key = req.urlWithParams;
  const hit = store.get(key);

  if (hit && Date.now() < hit.exp) {
    return of(new HttpResponse({ body: hit.body, status: 200 }));
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        store.set(key, { body: event.body, exp: Date.now() + TTL });
      }
    }),
  );
};
