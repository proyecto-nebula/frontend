import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'auth-registration-account-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-account.ui.html',
  styleUrls: ['./registration-account.ui.scss'],
})
export class RegistrationAccountUi {
  @Input('formGroup') group!: FormGroup;
}
