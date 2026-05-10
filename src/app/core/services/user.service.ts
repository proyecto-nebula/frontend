import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';
import { AuthService } from '@services/auth.service';
import { User } from '@models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  /** Devuelve el perfil del usuario autenticado (o null si no hay token) */
  me(): Observable<User | null> {
    const token = this.auth.getToken();
    if (!token) return of(null);

    const apiBase = environment.apiUrl.replace(/\/api\/?v?\d*$/i, '');
    const id = this.parseTokenId(token);

    if (id) {
      return this.http.get<User>(`${API_ROUTES.users}?id=${id}`).pipe(
        map((u: any) => {
          if (!u) return null;
          if (u.avatarImage && typeof u.avatarImage === 'string') {
            const img = u.avatarImage as string;
            if (!/^https?:\/\//i.test(img)) {
              const cleaned = img.replace(/^\/+/, '');
              u.avatarImage = `${apiBase}/${cleaned}`;
            }
          }
          return u;
        }),
        catchError((err) => {
          console.error('[UserService] me failed', err);
          return of(null);
        }),
      );
    }

    // If token is not a JWT with an id, try lookup by token and then request full profile
    return this.http.get<User>(`${API_ROUTES.users}?token=${encodeURIComponent(token)}`).pipe(
      switchMap((u: any) => {
        if (!u) return of(null);
        if (u.id) {
          // fetch full profile (includes avatar_image via getPerfilCompleto)
          return this.http.get<User>(`${API_ROUTES.users}?id=${u.id}`).pipe(
            map((full: any) => {
              if (!full) return null;
              if (full.avatarImage && typeof full.avatarImage === 'string') {
                const img = full.avatarImage as string;
                if (!/^https?:\/\//i.test(img)) {
                  const cleaned = img.replace(/^\/+/, '');
                  full.avatarImage = `${apiBase}/${cleaned}`;
                }
              }
              return full;
            }),
            catchError((err) => {
              console.error('[UserService] me failed fetching full profile', err);
              return of(null);
            }),
          );
        }

        // fallback: if we have avatarId, fetch avatar
        if (u.avatarId) {
          return this.http.get<any>(`${API_ROUTES.avatars}?id=${u.avatarId}`).pipe(
            map((a: any) => {
              if (a && a.imageUrl) {
                let img = a.imageUrl as string;
                if (!/^https?:\/\//i.test(img)) {
                  img = img.replace(/^\/+/, '');
                  img = `${apiBase}/${img}`;
                }
                u.avatarImage = img;
              }
              return u;
            }),
            catchError((err) => {
              console.error('[UserService] me failed fetching avatar', err);
              return of(u);
            }),
          );
        }

        return of(u);
      }),
      catchError((err) => {
        console.error('[UserService] me failed token lookup', err);
        return of(null);
      }),
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_ROUTES.users).pipe(
      catchError((err) => {
        console.error('[UserService] getUsers failed', err);
        return of([] as User[]);
      }),
    );
  }

  private parseTokenId(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      let payload = parts[1];
      // base64url -> base64
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const obj = JSON.parse(json);
      const id = obj?.data?.id ?? obj?.id ?? null;
      return id !== null ? Number(id) : null;
    } catch {
      return null;
    }
  }
}
