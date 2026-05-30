import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { LogoComponent } from '@ui/logo/logo.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LogoComponent],
  templateUrl: './login-form.ui.html',
})
export class LoginFormUi {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  errorMessage = signal('');

  /** Emits after a successful login so the parent (page or modal) can react. */
  @Output() loggedIn = new EventEmitter<void>();

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.getRawValue();

    try {
      const response = await firstValueFrom(this.auth.login(email, password));

      if (response?.token) {
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
