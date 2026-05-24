import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  // Use Injector to lazily resolve AuthService and avoid circular DI:
  // AuthService.constructor makes HTTP calls → interceptor runs → inject(AuthService)
  // would try to resolve AuthService while it is still being constructed → NG0200.
  const injector = inject(Injector);
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
      if ((error.status === 401 || error.status === 403) && !isAuthLoginRequest && token) {
        console.warn('[authInterceptor] 401/403 on', clonedReq.method, clonedReq.url, error.error);
        // AuthService is fully constructed by the time a response error arrives (async)
        injector.get(AuthService).logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
