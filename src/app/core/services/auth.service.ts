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
  // isAuthenticated se basa solo en el signal: el token vive en cookie HttpOnly
  isAuthenticated = computed(() => !!this._user());
  readonly user = this._user.asReadonly();
  isAdmin = computed(() => this._user()?.roleId === 1);
  isEditor = computed(() => this._user()?.roleId === 2);
  isUser = computed(() => this._user()?.roleId === 3);
  isAdminOrEditor = computed(() => (this._user()?.roleId ?? 0) <= 2 && (this._user()?.roleId ?? 0) >= 1);

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(API_ROUTES.auth, { email, password }).pipe(
      tap(res => {
        if (res.token) {
          // El servidor estableció la cookie HttpOnly — no se guarda en localStorage.
          // Cargamos el perfil usando dicha cookie (el interceptor envía withCredentials).
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
    // Intentar restaurar sesión desde la cookie HttpOnly del servidor
    this.http.get<User>(API_ROUTES.users).subscribe(
      u => {
        this._user.set(u ?? null);
        this._userSubject.next(u ?? null);
        this._loadedSubject.next(true);
      },
      () => {
        // 401 = no hay sesión activa — no es un error de red
        this._loadedSubject.next(true);
      },
    );
  }

  /** El token vive en una cookie HttpOnly y no es accesible desde JS. */
  getToken(): string | null {
    return null;
  }

  logout() {
    // Pedir al servidor que invalide la cookie
    this.http.delete(API_ROUTES.auth).subscribe({ error: () => {} });
    this._user.set(null);
    this._userSubject.next(null);
  }

  /** Debug-only: switch displayed user without changing JWT */
  debugSetUser(user: User): void {
    this._user.set(user);
    this._userSubject.next(user);
  }
}

