import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  errorMessage = signal('');

  @Input() returnUrl: string | null = null;
  @Output() loggedIn = new EventEmitter<void>();

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials = this.loginForm.getRawValue();

    try {
      const response = await firstValueFrom(this.auth.login(credentials.email, credentials.password));

      if (response?.token) {
        // AuthService handles storing token and fetching profile.
        // Notify parent so it can decide whether to navigate or close modal.
        this.loggedIn.emit();
      } else {
        this.errorMessage.set('Respuesta inesperada del servidor');
      }
    } catch (err: unknown) {
      const error = err as HttpErrorResponse;
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
