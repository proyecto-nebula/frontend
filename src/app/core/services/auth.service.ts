// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_ROUTES } from '@config/api.routes';
import { AuthResponse, User } from '@models/user.model';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(null);
  private _userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this._userSubject.asObservable();
  private _loadedSubject = new BehaviorSubject<boolean>(false);
  readonly loaded$ = this._loadedSubject.asObservable();
  isAuthenticated = computed(() => !!this._user() || !!this.getToken());
  isAdmin = computed(() => this._user()?.roleId === 1);
  isUser = computed(() => this._user()?.roleId === 2);

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(API_ROUTES.auth, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          // Fetch profile; el interceptor añade el Bearer header automáticamente
          this.http.get<User>(API_ROUTES.users).subscribe(
            u => {
              this._user.set(u ?? null);
              this._userSubject.next(u ?? null);
            },
            err => {
              console.error('[AuthService] failed to fetch profile after login', err);
            },
          );
        }
      }),
    );
  }

  constructor() {
    const token = this.getToken();
    if (token) {
      this.http.get<User>(API_ROUTES.users).subscribe(
        u => {
          this._user.set(u ?? null);
          this._userSubject.next(u ?? null);
          this._loadedSubject.next(true);
        },
        err => {
          console.error('[AuthService] failed to fetch profile on init', err);
          this._loadedSubject.next(true);
        },
      );
    } else {
      this._loadedSubject.next(true);
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

  /** Debug-only: switch displayed user without changing JWT */
  debugSetUser(user: User): void {
    this._user.set(user);
    this._userSubject.next(user);
  }
}
