import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';
import { User } from '@models/user.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  /** Devuelve el perfil del usuario autenticado via cookie HttpOnly. */
  me(): Observable<User | null> {
    return this.http.get<User>(API_ROUTES.users).pipe(
      catchError(() => of(null)),
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
}


