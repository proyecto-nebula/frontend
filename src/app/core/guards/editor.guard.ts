import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '@services/auth.service';

/** Allows only Editors (roleId=2). Returns false to let Angular fall through to the next matching route. */
export const editorGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.loaded$.pipe(
    filter(loaded => loaded),
    take(1),
    map(() => authService.isEditor()),
  );
};
