import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('api-key');

  // Si tenemos token, clonamos la petición y añadimos el header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        'api-key': token,
      },
    });
    return next(cloned);
  }

  return next(req);
};
