import { inject } from '@angular/core';
import { CanMatchFn, Route, UrlSegment } from '@angular/router';
import { catchError, filter, map, of, switchMap, take } from 'rxjs';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';

/** Blocks access to /play/:slug when the user is younger than the game's PEGI rating.
 *  Returns false to let Angular fall through to the ForbiddenPage fallback route (no URL change). */
export const ageGuard: CanMatchFn = (_route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const gameService = inject(GameService);
  const slug = segments[0]?.path ?? '';

  return authService.loaded$.pipe(
    filter(loaded => loaded),
    take(1),
    switchMap(() => {
      const user = authService.user();
      if (!user?.birthDate || !slug) return of(true);
      return gameService.getGameBySlug(slug).pipe(
        take(1),
        map(game => {
          const pegiName = game?.pegi?.name ?? '';
          const match = /\d+/.exec(pegiName);
          const pegiAge = match ? parseInt(match[0], 10) : NaN;
          if (isNaN(pegiAge)) return true;

          const birth = new Date(user.birthDate!);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

          return age >= pegiAge;
        }),
        catchError(() => of(true)),
      );
    }),
  );
};
