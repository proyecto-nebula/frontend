import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { RegistrationAccountUi } from '../../ui/registration-account/registration-account.ui';
import { RegistrationPaymentUi } from '../../ui/registration-payment/registration-payment.ui';
import { RegistrationPlanUi } from '../../ui/registration-plan/registration-plan.ui';
import { RegistrationProfileUi } from '../../ui/registration-profile/registration-profile.ui';
import { RegistrationVerifyEmailUi } from '../../ui/registration-verify-email/registration-verify-email.ui';
// registration success moved to web and shown as modal on home
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';
import { Avatar } from '@models/avatar.model';
import { Plan } from '@models/plan.model';
import { AuthService } from '@services/auth.service';
import { AvatarsService } from '@services/avatars.service';
import { PlansService } from '@services/plans.service';
import { SettingsService } from '@services/settings.service';
import { firstValueFrom } from 'rxjs';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  const errors: ValidationErrors = {};
  if (v.length < 6) errors['minLength'] = true;
  if (!/[A-Z]/.test(v)) errors['noUppercase'] = true;
  if (!/[0-9]/.test(v)) errors['noNumber'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'auth-join-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegistrationAccountUi,
    RegistrationVerifyEmailUi,
    RegistrationProfileUi,
    RegistrationPlanUi,
    RegistrationPaymentUi,
  ],
  templateUrl: './join.page.html',
})
export class JoinPage {
  form: FormGroup;
  phase = 0; // 0-4
  showValidation = false;
  processingPayment = false;
  // passwordValidationEnabled is now global via SettingsService
  avatars: Avatar[] = [];
  selectedAvatar: Avatar | null = null;
  plans: Plan[] = [];
  saving = false;
  private _logPrefix = '[JoinPage]';

  get account(): FormGroup {
    return this.form.get('account') as FormGroup;
  }
  get profile(): FormGroup {
    return this.form.get('profile') as FormGroup;
  }
  get plan(): FormGroup {
    return this.form.get('plan') as FormGroup;
  }
  get payment(): FormGroup {
    return this.form.get('payment') as FormGroup;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private avatarsService: AvatarsService,
    private plansService: PlansService,
    private auth: AuthService,
    public settings: SettingsService,
    private titleService: Title,
  ) {
    this.titleService.setTitle('Crear cuenta — Nebula');
    const pwValidators = [Validators.required];
    if (this.settings.getPasswordValidationEnabled()) pwValidators.push(passwordStrengthValidator);

    this.form = this.fb.group({
      account: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', pwValidators],
        birthdateDay: [null, Validators.required],
        birthdateMonth: [null, Validators.required],
        birthdateYear: [null, Validators.required],
      }),
      profile: this.fb.group({
        username: ['', Validators.required],
        avatarId: [null, Validators.required],
      }),
      plan: this.fb.group({ planId: [null] }),
      payment: this.fb.group({
        nameOnCard: ['John Doe', Validators.required],
        cardNumber: ['4111111111111111', Validators.required],
        expiry: ['12/28', Validators.required],
        cvc: ['123', Validators.required],
      }),
    });

    // Subscribe to changes in the global setting to update validators live
    this.settings.passwordValidationEnabled$.subscribe(enabled => this.updatePasswordValidators(enabled));

    this.loadLists().catch(e => console.error(this._logPrefix, 'loadLists error', e));
  }

  private updatePasswordValidators(enabled: boolean) {
    const ctrl = this.form.get('account.password');
    if (!ctrl) return;
    const validators = [Validators.required];
    if (enabled) validators.push(passwordStrengthValidator);
    ctrl.setValidators(validators as any);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  async loadLists() {
    try {
      this.avatars = await firstValueFrom(this.avatarsService.list());
      this.plans = await firstValueFrom(this.plansService.list());
    } catch (e) {
      console.error(this._logPrefix, 'loadLists failed', e);
      this.avatars = [];
      this.plans = [];
    }
  }

  onAvatarSelected(avatar: Avatar | null) {
    this.selectedAvatar = avatar;
    if (avatar) this.profile.patchValue({ avatarId: avatar.id });
  }

  get currentGroup(): FormGroup {
    switch (this.phase) {
      case 0:
        return this.account;
      case 1:
        return this.account; // verify phase — validation skipped in next()
      case 2:
        return this.profile;
      case 3:
        return this.plan;
      case 4:
        return this.payment;
      default:
        return this.account;
    }
  }

  get nextLabel(): string {
    if (this.processingPayment || this.saving) return 'Procesando...';
    if (this.phase === 3) {
      const selected = this.form.get('plan.planId')?.value;
      return selected !== null && selected !== undefined ? 'Pagar' : 'Omitir';
    }
    if (this.phase === 4) return 'Pagar';
    return 'Siguiente';
  }

  async next() {
    if (this.phase > 4 || this.saving || this.processingPayment) return;

    // Phase 1 — email verification (simulated, skip validation)
    if (this.phase === 1) {
      this.showValidation = false;
      this.phase = 2;
      return;
    }

    // Phase 3 — plan is optional
    if (this.phase === 3) {
      const planId = this.plan.get('planId')?.value;
      if (planId === null || planId === undefined) {
        await this.saveUser();
        return;
      }
      this.phase = 4;
      return;
    }

    if (!this.currentGroup.valid) {
      this.showValidation = true;
      this.currentGroup.markAllAsTouched();
      return;
    }

    // Reset validation flag when moving forward after valid input
    this.showValidation = false;

    if (this.phase === 4) {
      this.processingPayment = true;
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.processingPayment = false;
      await this.saveUser();
      return;
    }

    this.phase = Math.min(4, this.phase + 1);
  }

  back() {
    if (this.saving || this.processingPayment) return;
    this.phase = Math.max(0, this.phase - 1);
  }

  async saveUser() {
    if (this.saving) return;
    this.saving = true;
    const account = this.form.get('account')?.value ?? {};
    const profile = this.form.get('profile')?.value ?? {};
    const plan = this.form.get('plan')?.value ?? {};

    const mm = String(account.birthdateMonth ?? 1).padStart(2, '0');
    const dd = String(account.birthdateDay ?? 1).padStart(2, '0');
    const birthDate = `${account.birthdateYear ?? ''}-${mm}-${dd}`;

    const payloadWithRole = {
      username: profile.username,
      email: account.email,
      password: account.password,
      avatarId: profile.avatarId ?? null,
      planId: plan.planId ?? null,
      birthDate,
      roleId: 3,
    };

    try {
      await firstValueFrom(this.http.post(API_ROUTES.users, payloadWithRole));
      try {
        this.auth.logout();
        await firstValueFrom(this.auth.login(payloadWithRole.email, account.password));
        const planName = (this.plans || []).find((p: Plan) => +p.id === +payloadWithRole.planId)?.name ?? '';
        const qs = `?registered=1&username=${encodeURIComponent(payloadWithRole.username ?? '')}&planName=${encodeURIComponent(planName)}`;
        window.location.href = '/' + qs;
      } catch (loginErr) {
        console.error(this._logPrefix, 'auto-login failed', loginErr);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.saving = false;
    }
  }
}
