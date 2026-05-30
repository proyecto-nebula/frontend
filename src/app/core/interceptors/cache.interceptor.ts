import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Cache interceptor — fuerza no-cache en todas las peticiones GET para que el navegador
 * no reutilice respuestas antiguas de la API.
 *
 * Para desactivar este comportamiento y volver a pass-through:
 *   return next(req);
 */
// Las cabeceras no-cache se aplican en el backend (Response.php).
// No las enviamos desde el cliente para evitar errores CORS en preflight.
// Para reactivar caché de lado cliente: añadir lógica aquí con setHeaders o shareReplay.
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
