import { Component, inject } from '@angular/core';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (t of toastSvc.toasts(); track t.id) {
        <div class="toast toast--{{ t.type }}" (click)="toastSvc.dismiss(t.id)">
          <span class="toast__icon">
            @switch (t.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @default { ℹ }
            }
          </span>
          <span class="toast__msg">{{ t.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected toastSvc = inject(ToastService);
}
