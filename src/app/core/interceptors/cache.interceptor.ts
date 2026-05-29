import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

/**
 * Endpoints excluidos del caché — datos de autenticación o mutables por usuario.
 */
const NO_CACHE_PATTERNS = ['/auth', '/sessions', '/favorites', '/users', '/logs'];

/** Tiempo de vida de cada entrada (ms). */
const TTL = 10 * 1000; // 10 segundos
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

/** Limpia TODA la caché de la app. Se llama en cualquier mutación para garantizar datos frescos. */
function invalidateAll(): void {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(PFX)) sessionStorage.removeItem(k);
    }
  } catch { /* ignorar */ }
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Mutations: limpiar TODO el caché y (si son favoritos) notificar subscriptores
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          invalidateAll();
          // Si es una mutación de favoritos, notificar a my-games y componentes similares
          if (req.url.includes('/favorites')) {
            try {
              if (typeof window !== 'undefined' && 'CustomEvent' in window) {
                window.dispatchEvent(new CustomEvent('nebula:mutated', { detail: { resource: 'favorites' } }));
              }
            } catch { /* ignore */ }
          }
        }
      }),
    );
  }

  // Excluir peticiones con user_id (datos mutables por usuario)
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
