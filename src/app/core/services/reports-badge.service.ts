import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportsBadgeService {
  private readonly _count = signal(0);
  readonly count = this._count.asReadonly();

  set(n: number): void { this._count.set(n); }
  decrement(): void { this._count.update(n => Math.max(0, n - 1)); }
  increment(): void { this._count.update(n => n + 1); }
}
