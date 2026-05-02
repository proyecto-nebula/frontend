// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { AuthResponse, User } from '@models/user.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  isAuthenticated = computed(() => !!this._user() || !!this.getToken());
  isAdmin = computed(() => this._user()?.roleId === 1);
  isUser = computed(() => this._user()?.roleId === 4);

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(API_ROUTES.auth, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          //this._user.set({ username } as User);
        }
      }),
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
