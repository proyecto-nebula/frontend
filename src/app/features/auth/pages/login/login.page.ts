import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async onLogin() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.getRawValue() as LoginCredentials;

    try {
      const response = await firstValueFrom(this.auth.login(credentials.email, credentials.password));

      console.log('Respuesta del servidor:', response);

      if (response?.token) {
        console.log('Login OK, redirigiendo a /games...');
        await this.router.navigate(['/games']);
      } else {
        this.errorMessage.set('Respuesta inesperada del servidor');
      }
    } catch (err: unknown) {
      const error = err as HttpErrorResponse;
      console.error('Error capturado:', error);

      if (error.status === 401 || error.status === 403) {
        this.errorMessage.set('Alias o contraseña incorrectos.');
      } else if (error.status === 0) {
        this.errorMessage.set('No se pudo conectar con el servidor (CORS o Docker caído).');
      } else {
        this.errorMessage.set('Error en el servidor: ' + (error.error?.message || 'Desconocido'));
      }
    } finally {
      this.loading.set(false);
    }
  }
}
