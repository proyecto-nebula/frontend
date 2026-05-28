import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { environment } from '@env/environment';
import { API_ROUTES } from '@config/api.routes';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const injector = inject(Injector);
  const isOwnApi = req.url.startsWith(environment.apiUrl);
  const isAuthRequest = req.url.includes('/auth');

  let clonedReq = req;
  if (isOwnApi) {
    // withCredentials permite al navegador enviar la cookie HttpOnly al backend
    clonedReq = req.clone({ withCredentials: true });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !isAuthRequest) {
        console.warn('[authInterceptor] 401/403 on', clonedReq.method, clonedReq.url, error.error);
        injector.get(AuthService).logout();
        // Avoid auto-navigating to login for the initial "GET /users" session check,
        // which is expected to return 401 when no session exists.
        if (!clonedReq.url.includes(API_ROUTES.users)) {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
