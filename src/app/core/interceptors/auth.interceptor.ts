import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const isAuthLoginRequest = req.url.includes('/api/v1/auth');

  // Si tenemos token, clonamos la petición y añadimos el header Authorization Bearer
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if ((error.status === 401 || error.status === 403) && !isAuthLoginRequest) {
          localStorage.removeItem('token');
          router.navigate(['/login']);
        }

        return throwError(() => error);
      }),
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !isAuthLoginRequest) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
