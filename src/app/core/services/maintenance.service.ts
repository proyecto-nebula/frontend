import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  readonly isDown = signal(false);

  private http = inject(HttpClient);

  setDown(val: boolean): void {
    this.isDown.set(val);
  }

  check(): void {
    this.http.get(API_ROUTES.games, { params: { limit: '1' } }).subscribe({
      next: () => this.isDown.set(false),
      error: () => {},
    });
  }
}
