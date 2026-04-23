import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '@models/usuario.model';
import { AuthService } from '@services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Estado de carga para deshabilitar el botón mientras se valida
  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    email_usuario: ['', [Validators.required]],
    password_usuario: ['', [Validators.required]],
  });

  async onLogin() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.getRawValue() as LoginCredentials;

    try {
      // 1. Convertimos a promesa pero con un timeout o manejo claro
      const response = await firstValueFrom(this.auth.login(credentials.email_usuario, credentials.password_usuario));

      console.log('Respuesta del servidor:', response);

      if (response?.token) {
        // 2. Si todo va bien, redirigimos
        console.log('Login OK, redirigiendo...');
        await this.router.navigate(['/']);
      } else {
        this.errorMessage.set('Respuesta inesperada del servidor');
      }
    } catch (err: unknown) {
      const error = err as HttpErrorResponse;
      console.error('Error capturado:', error);

      // 3. Diferenciamos errores
      if (error.status === 401 || error.status === 403) {
        this.errorMessage.set('Alias o contraseña incorrectos.');
      } else if (error.status === 0) {
        this.errorMessage.set('No se pudo conectar con el servidor (CORS o Docker caído).');
      } else {
        this.errorMessage.set('Error en el servidor: ' + (error.error?.message || 'Desconocido'));
      }
    } finally {
      // 4. IMPORTANTE: Siempre liberar el estado de carga para que el botón se reactive
      this.loading.set(false);
    }
  }
}
