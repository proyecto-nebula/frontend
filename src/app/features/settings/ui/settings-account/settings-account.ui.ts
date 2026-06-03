import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, inject } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { API_ROUTES } from '@config/api.routes';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'settings-account-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-account.ui.html',
})
export class SettingsAccountUi implements OnInit {
  @Input('formGroup') group!: FormGroup;
  @Input() passwordValidationEnabled = true;

  private http = inject(HttpClient);

  emailChecking = false;
  emailTaken = false;
  showPassword = false;
  showOldPassword = false;
  showNewPassword = false;

  get emailCtrl(): AbstractControl {
    return this.group.get('email')!;
  }
  get oldPasswordCtrl(): AbstractControl {
    return this.group.get('oldPassword')!;
  }
  get passwordCtrl(): AbstractControl {
    return this.group.get('password')!;
  }
  get passwordConfirmCtrl(): AbstractControl {
    return this.group.get('passwordConfirm')!;
  }

  ngOnInit() {
    // Validación de email duplicado similar a RegistrationAccountUi
    this.emailCtrl.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap(val => {
          const ctrl = this.emailCtrl;
          if (ctrl.hasError('required') || ctrl.hasError('email')) {
            this.emailTaken = false;
            this.emailChecking = false;
            return of([]);
          }
          this.emailChecking = true;
          return this.http
            .get<any[]>(`${API_ROUTES.users}?email=${encodeURIComponent(val)}`)
            .pipe(catchError(() => of([])));
        }),
      )
      .subscribe(res => {
        this.emailChecking = false;
        const taken = Array.isArray(res) ? res.length > 0 : false;
        this.emailTaken = taken;
        const ctrl = this.emailCtrl;
        const current = { ...(ctrl.errors ?? {}) };
        if (taken) {
          ctrl.setErrors({ ...current, emailTaken: true });
        } else {
          delete current['emailTaken'];
          if (Object.keys(current).length === 0) {
            ctrl.setErrors(null);
          } else {
            ctrl.setErrors(current);
          }
        }
      });
  }

  get passwordStrengthChecks(): { label: string; ok: boolean }[] {
    if (!this.passwordValidationEnabled) return [];
    const pw = this.passwordCtrl.value ?? '';
    return [
      { label: 'Mínimo 6 caracteres', ok: pw.length >= 6 },
      { label: 'Al menos una mayúscula', ok: /[A-Z]/.test(pw) },
      { label: 'Al menos un número', ok: /[0-9]/.test(pw) },
    ];
  }

  get passwordStrengthLevel(): 'weak' | 'medium' | 'strong' {
    const checks = this.passwordStrengthChecks;
    if (checks.length === 0) return 'strong';
    const ok = checks.filter(c => c.ok).length;
    if (ok === checks.length) return 'strong';
    if (ok >= Math.ceil(checks.length / 2)) return 'medium';
    return 'weak';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleOldPassword() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }
}
