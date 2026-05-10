import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'auth-registration-payment-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-payment.ui.html',
  styleUrls: ['./registration-payment.ui.scss'],
})
export class RegistrationPaymentUi {
  @Input() group!: FormGroup;
}
