import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationAccountUi } from '../../ui/registration-account.ui';
import { RegistrationProfileUi } from '../../ui/registration-profile.ui';
import { RegistrationPlanUi } from '../../ui/registration-plan.ui';
import { RegistrationPaymentUi } from '../../ui/registration-payment.ui';
// registration success moved to web and shown as modal on home
import { AvatarsService } from '../../services/avatars.service';
import { PlansService } from '../../services/plans.service';
import { AuthService } from '@services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Avatar } from '@models/avatar.model';
import { Plan } from '@models/plan.model';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';

@Component({
  selector: 'auth-join-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RegistrationAccountUi, RegistrationProfileUi, RegistrationPlanUi, RegistrationPaymentUi],
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss'],
})
export class JoinPage {
  form: FormGroup;
  phase = 0; // 0..4
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
  ) {
    console.log(this._logPrefix, 'constructed');
    this.form = this.fb.group({
      account: this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]] }),
      profile: this.fb.group({ username: ['', Validators.required], birthdate: ['', Validators.required], avatarId: [null, Validators.required] }),
      plan: this.fb.group({ planId: [null] }),
      payment: this.fb.group({ nameOnCard: ['', Validators.required], cardNumber: ['', Validators.required], expiry: ['', Validators.required], cvc: ['', Validators.required] }),
    });

    // load lists
    this.loadLists().catch((e) => console.error(this._logPrefix, 'loadLists error', e));
  }

  async loadLists() {
    try {
      console.log(this._logPrefix, 'loading avatars and plans');
      this.avatars = await firstValueFrom(this.avatarsService.list());
      this.plans = await firstValueFrom(this.plansService.list());
      console.log(this._logPrefix, 'loaded', { avatars: this.avatars?.length, plans: this.plans?.length });
    } catch (e) {
      console.error(this._logPrefix, 'loadLists failed', e);
      this.avatars = [];
      this.plans = [];
    }
  }

  onAvatarSelected(avatar: Avatar | null) {
    console.log(this._logPrefix, 'avatarSelected', avatar);
    this.selectedAvatar = avatar;
    // ensure profile group has avatarId (the child already patches it)
    if (avatar) this.profile.patchValue({ avatarId: avatar.id });
  }

  get currentGroup(): FormGroup {
    const idx = Number(this.phase) || 0;
    switch (idx) {
      case 0:
        return this.account;
      case 1:
        return this.profile;
      case 2:
        return this.plan;
      case 3:
        return this.payment;
      default:
        return this.account;
    }
  }

  get nextLabel() {
    const selected = this.form.get('plan.planId')?.value;
    if (this.phase === 2) {
      return (selected !== null && selected !== undefined) ? 'Pagar' : 'Omitir';
    }
    if (this.phase === 3) return 'Pagar';
    if (this.phase === 4) return 'Finalizado';
    return 'Siguiente';
  }

  async next() {
    const idx = Number(this.phase) || 0;
    console.log(this._logPrefix, 'next clicked, phase=', idx);
    if (idx >= 4) return;

    // Phase 2 (plan): selection is optional — "Omitir" skips, "Pagar" proceeds to payment
    if (idx === 2) {
      const planId = this.plan.get('planId')?.value;
      if (planId === null || planId === undefined) {
        // Omitir — save user with no plan
        await this.saveUser();
        return;
      }
      // Plan selected — go to payment
      this.phase = 3;
      return;
    }

    if (!this.currentGroup.valid) {
      this.currentGroup.markAllAsTouched();
      return;
    }

    if (idx === 3) {
      // payment (dummy)
      console.log(this._logPrefix, 'processing payment and saving user');
      await this.saveUser();
      this.phase = 4;
      return;
    }

    this.phase = Math.min(4, idx + 1);
    console.log(this._logPrefix, 'moved to phase', this.phase);
  }

  back() {
    const idx = Number(this.phase) || 0;
    this.phase = Math.max(0, idx - 1);
    console.log(this._logPrefix, 'back clicked, now phase=', this.phase);
  }

  async saveUser() {
    if (this.saving) return;
    this.saving = true;
    const account = this.form.get('account')?.value || {};
    const profile = this.form.get('profile')?.value || {};
    const plan = this.form.get('plan')?.value || {};

    // Flatten payload expected by /users endpoint (backend converts camelCase -> snake_case)
    const userPayload = {
      username: profile.username,
      email: account.email,
      password: account.password,
      avatarId: profile.avatarId ?? null,
      planId: plan.planId ?? null,
      birthDate: profile.birthdate ?? null,
    };

    try {
      const url = API_ROUTES.users; // POST /api/v1/users
      // Include default roleId = 1 (usuario normal)
      const payloadWithRole = { ...userPayload, roleId: 1 };
      const res = await firstValueFrom(this.http.post(url, payloadWithRole));
      console.log(this._logPrefix, 'register response', res);

      // Auto-login after successful registration
      try {
        await firstValueFrom(this.auth.login(userPayload.email, userPayload.password));
        // compute planName for friendly message
        const planName = (this.plans || []).find((p: Plan) => +p.id === +userPayload.planId)?.name || '';
        // Redirect to home with query params so Home can show success modal. Use full reload to ensure global state picks up token.
        const qs = `?registered=1&username=${encodeURIComponent(userPayload.username||'')}&planName=${encodeURIComponent(planName)}`;
        window.location.href = '/' + qs;
        return;
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
