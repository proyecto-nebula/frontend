import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';
import { Avatar } from '@models/avatar.model';
import { Observable, map, tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvatarsService {
  private http = inject(HttpClient);

  list(): Observable<Avatar[]> {
    return this.http.get<Avatar[] | { avatars: Avatar[] }>(API_ROUTES.avatars).pipe(
      tap((raw) => console.debug('[AvatarsService] raw response', raw)),
      map((data: any) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.avatars)) return data.avatars;
        if (Array.isArray(data.data)) return data.data;
        return [];
      }),
      tap((items) => console.debug('[AvatarsService] mapped avatars', items)),
      catchError((err) => {
        console.error('[AvatarsService] request failed', err);
        return of([] as Avatar[]);
      }),
    );
  }
}
