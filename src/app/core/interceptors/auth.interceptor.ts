import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
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
        auth.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
