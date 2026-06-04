import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'auth-registration-payment-ui',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registration-payment.ui.html',
})
export class RegistrationPaymentUi implements OnInit {
  @Input() group!: FormGroup;
  @ViewChildren('cardBox') cardBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  cardGroups = ['4111', '1111', '1111', '1111'];

  ngOnInit() {
    const val: string = this.group.get('cardNumber')?.value ?? '';
    if (val.length >= 12) {
      this.cardGroups = [val.slice(0, 4), val.slice(4, 8), val.slice(8, 12), val.slice(12, 16)];
    }
    this.syncCard();
  }

  onCardInput(i: number, event: Event) {
    const inp = event.target as HTMLInputElement;
    const digits = inp.value.replace(/\D/g, '').slice(0, 4);
    this.cardGroups[i] = digits;
    inp.value = digits;
    if (digits.length === 4 && i < 3) {
      this.cardBoxes.toArray()[i + 1]?.nativeElement.focus();
    }
    this.syncCard();
  }

  onCardKeydown(i: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.cardGroups[i] && i > 0) {
      this.cardBoxes.toArray()[i - 1]?.nativeElement.focus();
    }
  }

  onExpiryInput(event: Event) {
    const inp = event.target as HTMLInputElement;
    let value = inp.value.replace(/\D/g, '');
    if (value.length >= 2) {
      const mm = value.slice(0, 2);
      const yy = value.slice(2, 4);
      inp.value = `${mm}/${yy}`;
    } else {
      inp.value = value;
    }
    this.group.get('expiry')?.setValue(inp.value, { emitEvent: false });
  }

  onCvcInput(event: Event) {
    const inp = event.target as HTMLInputElement;
    inp.value = inp.value.replace(/\D/g, '').slice(0, 4);
    this.group.get('cvc')?.setValue(inp.value, { emitEvent: false });
  }

  private syncCard() {
    this.group.get('cardNumber')?.setValue(this.cardGroups.join(''), { emitEvent: false });
  }
}
