import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { API_ROUTES } from '@config/api.routes';

@Component({
  selector: 'auth-registration-account-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-account.ui.html',
  styleUrls: ['./registration-account.ui.scss'],
})
export class RegistrationAccountUi implements OnInit {
  @Input('formGroup') group!: FormGroup;

  private http = inject(HttpClient);

  readonly MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  readonly currentYear = new Date().getFullYear();
  readonly years: number[] = Array.from({ length: 101 }, (_, i) => this.currentYear - i);
  readonly days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  emailChecking = false;
  emailTaken = false;
  showPassword = false;

  get emailCtrl() { return this.group.get('email'); }
  get passwordCtrl() { return this.group.get('password'); }

  ngOnInit() {
    this.emailCtrl?.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap(val => {
        const ctrl = this.emailCtrl;
        if (!ctrl || ctrl.hasError('required') || ctrl.hasError('email')) {
          this.emailTaken = false;
          this.emailChecking = false;
          return of([]);
        }
        this.emailChecking = true;
        return this.http.get<any[]>(`${API_ROUTES.users}?email=${encodeURIComponent(val)}`).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(res => {
      this.emailChecking = false;
      const taken = Array.isArray(res) ? res.length > 0 : false;
      this.emailTaken = taken;
      const ctrl = this.emailCtrl;
      if (!ctrl) return;
      const current = { ...(ctrl.errors ?? {}) };
      if (taken) {
        ctrl.setErrors({ ...current, emailTaken: true });
      } else {
        delete current['emailTaken'];
        ctrl.setErrors(Object.keys(current).length ? current : null);
      }
    });
  }

  get passwordStrengthChecks(): { label: string; ok: boolean }[] {
    const pw = this.passwordCtrl?.value ?? '';
    return [
      { label: 'Mínimo 8 caracteres', ok: pw.length >= 8 },
      { label: 'Al menos una mayúscula', ok: /[A-Z]/.test(pw) },
      { label: 'Al menos un número', ok: /[0-9]/.test(pw) },
    ];
  }

  get passwordStrengthLevel(): 'weak' | 'medium' | 'strong' {
    const ok = this.passwordStrengthChecks.filter(c => c.ok).length;
    if (ok === 3) return 'strong';
    if (ok === 2) return 'medium';
    return 'weak';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
