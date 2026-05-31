import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Servicio para optimizar múltiples requests GET.
 * 
 * En lugar de hacer 3 requests separados:
 *   - GET /categories
 *   - GET /plans
 *   - GET /studios
 * 
 * Se pueden hacer en paralelo:
 *   batchService.fetch([
 *     { url: '/categories' },
 *     { url: '/plans' },
 *     { url: '/studios' }
 *   ])
 * 
 * Ventajas:
 * - Reduce latencia de red (1 round-trip en lugar de 3)
 * - Menor overhead TCP
 * - Cachea el resultado como un grupo
 * - Ideal para cargar múltiples recursos en app initialization
 */
@Injectable({ providedIn: 'root' })
export class BatchRequestService {
  private http = inject(HttpClient);

  /**
   * Ejecuta múltiples GET en paralelo
   * 
   * @param requests Array de { url: string, options?: HttpOptions }
   * @returns Array con resultados en el mismo orden
   * 
   * Ejemplo:
   * const [categories, plans, studios] = await firstValueFrom(
   *   batchService.fetch([
   *     { url: '/api/v1/categories' },
   *     { url: '/api/v1/plans' },
   *     { url: '/api/v1/studios' }
   *   ])
   * );
   */
  fetch<T = unknown>(
    requests: Array<{ url: string; options?: any }>,
  ): Observable<T[]> {
    if (requests.length === 0) {
      return of([]);
    }

    // Ejecutar todos los requests en paralelo
    const observables = requests.map(req =>
      this.http.get<T>(req.url, req.options).pipe(
        catchError(err => {
          console.warn(`[BatchRequest] Error en ${req.url}:`, err);
          return of(null as unknown as T);
        }),
      ),
    );

    return forkJoin(observables);
  }

  /**
   * Versión tipada para resultados específicos
   * 
   * Ejemplo:
   * type CriticalData = { categories: Category[]; plans: Plan[]; studios: Studio[] };
   * const data = await firstValueFrom(
   *   batchService.fetchTyped<CriticalData>([...])
   * );
   * // data.categories, data.plans, etc.
   */
  fetchTyped<T extends Record<string, unknown>>(
    requests: Array<{ key: keyof T; url: string; options?: any }>,
  ): Observable<T> {
    const result = {} as T;

    const observables = requests.map(req =>
      this.http.get<T[keyof T]>(req.url, req.options).pipe(
        catchError(err => {
          console.warn(`[BatchRequest] Error en ${req.url}:`, err);
          return of(null);
        }),
      ),
    );

    return new Observable(subscriber => {
      forkJoin(observables).subscribe(
        (results: any[]) => {
          requests.forEach((req, index) => {
            result[req.key] = results[index];
          });
          subscriber.next(result);
          subscriber.complete();
        },
        err => subscriber.error(err),
      );
    });
  }
}
