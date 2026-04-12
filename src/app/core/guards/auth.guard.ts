import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Si está autenticado, adelante
  if (authService.isAuthenticated()) {
    return true;
  }

  // 2. Si NO está autenticado y NO está ya en el login, redirigir
  // state.url nos dice a dónde intenta ir el usuario
  if (state.url === '/login') {
    return true;
  }

  return router.parseUrl('/login');
};
