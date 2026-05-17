import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@services/auth.service';

export const adminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.loaded$.pipe(
    filter(loaded => loaded),
    take(1),
    map(() => authService.isAdmin()),
  );
};
