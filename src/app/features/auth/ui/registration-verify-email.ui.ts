import { Component, Input, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'auth-registration-verify-email-ui',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-verify-email.ui.html',
  styleUrls: ['./registration-verify-email.ui.scss'],
})
export class RegistrationVerifyEmailUi {
  @Input() email = '';
  @ViewChildren('codeBox') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = ['', '', '', '', '', ''];

  onInput(i: number, event: Event) {
    const inp = event.target as HTMLInputElement;
    const val = inp.value.replace(/[^a-zA-Z0-9]/, '').slice(-1);
    this.digits[i] = val;
    inp.value = val;
    if (val && i < 5) {
      this.boxes.toArray()[i + 1]?.nativeElement.focus();
    }
  }

  onKeydown(i: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.digits[i] && i > 0) {
      this.boxes.toArray()[i - 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    text.split('').forEach((c, i) => (this.digits[i] = c));
    const focusIdx = Math.min(text.length, 5);
    this.boxes.toArray()[focusIdx]?.nativeElement.focus();
  }
}
