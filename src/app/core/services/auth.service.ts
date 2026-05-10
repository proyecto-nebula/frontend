// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { AuthResponse, User } from '@models/user.model';
import { tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(null);
  private _userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this._userSubject.asObservable();
  isAuthenticated = computed(() => !!this._user() || !!this.getToken());
  isAdmin = computed(() => this._user()?.roleId === 1);
  isUser = computed(() => this._user()?.roleId === 4);

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(API_ROUTES.auth, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          // Fetch profile and update internal signals/subjects so UI updates reactively
          this.http.get<User>(`${API_ROUTES.users}?token=${encodeURIComponent(res.token)}`).subscribe(
            (u) => {
              this._user.set(u ?? null);
              this._userSubject.next(u ?? null);
            },
            (err) => {
              console.error('[AuthService] failed to fetch profile after login', err);
            },
          );
        }
      }),
    );
  }

  constructor() {
    // If there's an existing token on service init, fetch profile so UI is initialized
    const token = this.getToken();
    if (token) {
      this.http.get<User>(`${API_ROUTES.users}?token=${encodeURIComponent(token)}`).subscribe(
        (u) => {
          this._user.set(u ?? null);
          this._userSubject.next(u ?? null);
        },
        (err) => {
          console.error('[AuthService] failed to fetch profile on init', err);
        },
      );
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this._user.set(null);
    this._userSubject.next(null);
  }
}
