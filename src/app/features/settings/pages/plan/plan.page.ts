import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationPaymentUi } from '@auth/ui/registration-payment.ui';
import { RegistrationPlanUi } from '@auth/ui/registration-plan.ui';
import { API_ROUTES } from '@config/api.routes';
import { Plan } from '@models/plan.model';
import { AuthService } from '@services/auth.service';
import { PlansService } from '@services/plans.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings-plan-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RegistrationPlanUi, RegistrationPaymentUi],
  templateUrl: './plan.page.html',
})
export class PlanPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly plansService = inject(PlansService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUser = toSignal(this.authService.user$);

  readonly plans = signal<Plan[]>([]);
  readonly showPayment = signal(false);
  readonly saving = signal(false);

  readonly hasPlan = computed(() => {
    const u = this.currentUser();
    return u?.planId != null && Number(u.planId) > 0;
  });

  readonly currentPlanName = computed(() => {
    const u = this.currentUser();
    return this.plans().find(p => p.id === u?.planId)?.name ?? null;
  });

  planGroup!: FormGroup;
  paymentGroup!: FormGroup;

  readonly selectedPlanId = signal<number | null>(null);

  ngOnInit(): void {
    const userPlanId = this.currentUser()?.planId ?? null;

    this.planGroup = this.fb.group({ planId: [userPlanId] });
    this.paymentGroup = this.fb.group({
      nameOnCard: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiry: ['', Validators.required],
      cvc: ['', Validators.required],
    });

    this.selectedPlanId.set(userPlanId);
    this.planGroup.get('planId')!.valueChanges.subscribe(v => {
      this.selectedPlanId.set(v);
      this.showPayment.set(false);
    });

    this.plansService.list().subscribe(p => this.plans.set(p));
  }

  get canPay(): boolean {
    const sel = this.selectedPlanId();
    return sel != null && sel !== (this.currentUser()?.planId ?? null);
  }

  pay(): void {
    this.showPayment.set(true);
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  async confirmPayment(): Promise<void> {
    if (this.paymentGroup.invalid) {
      this.paymentGroup.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const planId = this.selectedPlanId();
      const user = this.currentUser();
      if (user && planId) {
        await firstValueFrom(this.http.patch(`${API_ROUTES.users}/${user.id}`, { planId }));
      }
      const planName = this.plans().find(p => p.id === planId)?.name ?? '';
      await this.router.navigate(['/settings'], {
        queryParams: { planChanged: 1, planName },
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.saving.set(false);
    }
  }
}
