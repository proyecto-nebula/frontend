import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { Session } from '@models/session.model';
import { Observable, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private http = inject(HttpClient);

  getByUser(userId: number): Observable<Session[]> {
    return this.http
      .get<Session[]>(`${API_ROUTES.sessions}?user_id=${userId}`)
      .pipe(catchError(() => of([])));
  }

  createSession(gameId: number): Observable<{ id: number }> {
    return this.http
      .post<{ id: number }>(API_ROUTES.sessions, { gameId })
      .pipe(catchError(() => of({ id: -1 })));
  }
}
