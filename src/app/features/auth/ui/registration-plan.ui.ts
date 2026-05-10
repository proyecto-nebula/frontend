import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Plan } from '@models/plan.model';

@Component({
  selector: 'auth-registration-plan-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-plan.ui.html',
  styleUrls: ['./registration-plan.ui.scss'],
})
export class RegistrationPlanUi {
  @Input() group!: FormGroup;
  @Input() plans: Plan[] = [];

  select(plan: Plan) {
    this.group.patchValue({ planId: plan.id });
  }
}
