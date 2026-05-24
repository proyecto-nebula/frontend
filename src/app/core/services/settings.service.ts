import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'passwordValidationEnabled';
  private passwordValidationEnabledSubject = new BehaviorSubject<boolean>(this.readInitial());

  readonly passwordValidationEnabled$ = this.passwordValidationEnabledSubject.asObservable();

  private readInitial(): boolean {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY);
      if (v === null) return true; // default true
      return v === 'true';
    } catch {
      return true;
    }
  }

  setPasswordValidationEnabled(enabled: boolean) {
    try {
      localStorage.setItem(this.STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }
    this.passwordValidationEnabledSubject.next(enabled);
  }

  getPasswordValidationEnabled(): boolean {
    return this.passwordValidationEnabledSubject.getValue();
  }
}
