import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginModalService {
  // null = closed, non-null = open (value is returnUrl or empty string)
  private _openSubject = new BehaviorSubject<string | null>(null);
  open$ = this._openSubject.asObservable();

  open(returnUrl?: string | null) {
    this._openSubject.next(returnUrl ?? '');
  }

  close() {
    this._openSubject.next(null);
  }
}
