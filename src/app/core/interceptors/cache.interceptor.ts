import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Cache interceptor — caché desactivado; todas las peticiones van directo al servidor.
 * Se puede reactivar en el futuro añadiendo lógica de TTL y patrones de exclusión.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
