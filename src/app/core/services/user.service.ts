import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { User } from '@models/user.model';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_ROUTES.users).pipe(catchError(err => throwError(() => err)));
  }
  // Otros métodos: getUserById, createUser, etc.
}
