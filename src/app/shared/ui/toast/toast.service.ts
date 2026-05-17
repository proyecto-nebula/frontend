import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private next = 0;

  show(type: Toast['type'], message: string, duration = 3500): void {
    const id = ++this.next;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show('success', message); }
  error(message: string): void { this.show('error', message, 5000); }
  info(message: string): void { this.show('info', message); }
  warning(message: string): void { this.show('warning', message); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
