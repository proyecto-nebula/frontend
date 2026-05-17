import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@ui/toast/toast.service';
import { MaintenanceService } from '@services/maintenance.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const maintenance = inject(MaintenanceService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0 || err.status === 503) {
        maintenance.setDown(true);
      } else if (err.status === 401) {
        // let authInterceptor / auth guard handle it
      } else if (err.status === 403) {
        toast.error('No tienes permiso para realizar esta acción.');
      } else if (err.status >= 500) {
        toast.error('Error del servidor. Inténtalo de nuevo más tarde.');
      } else if (err.status === 404) {
        // silently ignore
      } else if (err.status >= 400) {
        const msg = err.error?.message ?? 'Error en la solicitud.';
        toast.error(msg);
      }
      return throwError(() => err);
    }),
  );
};
