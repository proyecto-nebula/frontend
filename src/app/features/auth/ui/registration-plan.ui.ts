import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Plan } from '@models/plan.model';

@Component({
  selector: 'auth-registration-plan-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-plan.ui.html',
})
export class RegistrationPlanUi {
  @Input() group!: FormGroup;
  @Input() plans: Plan[] = [];

  select(plan: Plan) {
    const current = this.group.get('planId')?.value;
    this.group.patchValue({ planId: current === plan.id ? null : plan.id });
  }
}
