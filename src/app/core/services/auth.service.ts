// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthResponse, Usuario } from '@models/usuario.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://127.0.0.1:8000/api/v1/auth';

  private _user = signal<Usuario | null>(null);
  isAuthenticated = computed(() => !!this._user() || !!this.getToken());
  isAdmin = computed(() => this._user()?.id_rol === 1);
  isUser = computed(() => this._user()?.id_rol === 4);

  login(email_usuario: string, password_usuario: string) {
    return this.http.post<AuthResponse>(this.API_URL, { email_usuario, password_usuario }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('api-key', res.token);
          //this._user.set({ alias } as Usuario);
        }
      }),
    );
  }

  getToken() {
    return localStorage.getItem('api-key');
  }
}
