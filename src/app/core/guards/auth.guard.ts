import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@services/auth.service';

/**
 * Espera a que el estado de autenticación esté completamente cargado antes de decidir.
 * Esto evita redirecciones falsas cuando la cookie se verifica de forma asíncrona al inicio.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loaded$.pipe(
    filter(loaded => loaded),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) return true;
      if (state.url === '/auth/login') return true;
      return router.parseUrl('/auth/login');
    }),
  );
};
