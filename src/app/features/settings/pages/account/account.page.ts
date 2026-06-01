import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsAccountUi } from '@settings/ui/settings-account/settings-account.ui';
import { API_ROUTES } from '@config/api.routes';
import { AuthService } from '@services/auth.service';
import { SettingsService } from '@services/settings.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings-account-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SettingsAccountUi],
  templateUrl: './account.page.html',
})
export class AccountPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly settingsService = inject(SettingsService);

  readonly currentUser = toSignal(this.authService.user$);
  readonly form = signal<FormGroup | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly oldPasswordValid = signal(false);
  readonly passwordValidationEnabled: boolean;

  constructor() {
    this.passwordValidationEnabled = this.settingsService.getPasswordValidationEnabled();
  }

  ngOnInit() {
    const user = this.currentUser();
    const pwValidators = [Validators.required, Validators.minLength(6)];
    if (this.passwordValidationEnabled) {
      pwValidators.push(this.passwordStrengthValidator);
    }

    const formGroup = this.fb.group(
      {
        email: [user?.email ?? '', [Validators.required, Validators.email]],
        oldPassword: ['', Validators.required],
        password: ['', pwValidators],
        passwordConfirm: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    // Validar contraseña antigua en vivo
    formGroup.get('oldPassword')?.valueChanges.subscribe(() => {
      this.validateOldPassword();
    });

    this.form.set(formGroup);
  }

  private passwordStrengthValidator(control: FormGroup): { [key: string]: boolean } | null {
    const v: string = control.value ?? '';
    const errors: { [key: string]: boolean } = {};
    if (v.length < 6) errors['minLength'] = true;
    if (!/[A-Z]/.test(v)) errors['noUppercase'] = true;
    if (!/[0-9]/.test(v)) errors['noNumber'] = true;
    return Object.keys(errors).length ? errors : null;
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password');
    const passwordConfirm = group.get('passwordConfirm');
    if (!password || !passwordConfirm) return null;
    return password.value === passwordConfirm.value ? null : { passwordMismatch: true };
  }

  private async validateOldPassword() {
    const f = this.form();
    const oldPwCtrl = f?.get('oldPassword');
    if (!oldPwCtrl || !oldPwCtrl.value) {
      this.oldPasswordValid.set(false);
      return;
    }

    try {
      const user = this.currentUser();
      if (!user) {
        this.oldPasswordValid.set(false);
        return;
      }

      const response = await firstValueFrom(
        this.http.post<any>(`${API_ROUTES.auth}/validate-password`, {
          userId: user.id,
          password: oldPwCtrl.value,
        })
      );

      if (response.valid) {
        this.oldPasswordValid.set(true);
      } else {
        this.oldPasswordValid.set(false);
        oldPwCtrl.setErrors({ incorrectPassword: true });
      }
    } catch (err: any) {
      this.oldPasswordValid.set(false);
      oldPwCtrl.setErrors({ incorrectPassword: true });
    }
  }

  async saveChanges() {
    const f = this.form();
    if (!f || !f.valid) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    try {
      const updateData: any = {};

      if (f.get('email')?.dirty && f.get('email')?.value !== user.email) {
        updateData.email = f.get('email')?.value;
      }

      if (f.get('password')?.dirty && this.oldPasswordValid()) {
        updateData.password = f.get('password')?.value;
      }

      if (Object.keys(updateData).length === 0) {
        this.error.set('No hay cambios para guardar');
        return;
      }

      await firstValueFrom(this.http.patch(`${API_ROUTES.users}/${user.id}`, updateData));

      // Obtener usuario actualizado del servidor
      const updatedUser = await firstValueFrom(this.http.get<any>(`${API_ROUTES.users}`));
      this.authService.setUser(updatedUser);

      this.success.set(true);
      this.error.set(null);
      this.form()?.reset({ email: updateData.email || user.email });
      this.oldPasswordValid.set(false);
    } catch (err: any) {
      this.error.set(err.error?.details || 'Error guardando cambios');
      this.success.set(false);
    } finally {
      this.loading.set(false);
    }
  }
}
