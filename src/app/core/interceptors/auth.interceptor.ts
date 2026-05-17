import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const isAuthLoginRequest = req.url.includes('/auth');

  let clonedReq = req;
  // Solo añadir Authorization si hay token y no es login
  if (token && !isAuthLoginRequest) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only redirect to login if there was an active token that got rejected (expired session)
      // Don't redirect for unauthenticated requests (e.g. public endpoints, debug panel)
      if ((error.status === 401 || error.status === 403) && !isAuthLoginRequest && token) {
        localStorage.removeItem('token');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
