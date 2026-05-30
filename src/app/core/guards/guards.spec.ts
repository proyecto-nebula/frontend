import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { AuthService } from '@services/auth.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

// Helper to run a CanActivateFn inside TestBed injection context
function runGuard(guard: any, ...args: any[]) {
  return TestBed.runInInjectionContext(() => guard(...args));
}

const fakeState = (url: string) => ({ url } as RouterStateSnapshot);
const fakeRoute = {} as ActivatedRouteSnapshot;

describe('authGuard', () => {
  let loadedSubject: BehaviorSubject<boolean>;
  let authMock: Partial<AuthService>;

  beforeEach(() => {
    loadedSubject = new BehaviorSubject(false);
    authMock = {
      loaded$: loadedSubject.asObservable(),
      isAuthenticated: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authMock }],
    });
  });

  it('allows access when authenticated', fakeAsync(() => {
    vi.mocked(authMock.isAuthenticated!).mockReturnValue(true);
    let result: any;
    runGuard(authGuard, fakeRoute, fakeState('/dashboard')).subscribe(
      (v: any) => (result = v),
    );
    loadedSubject.next(true);
    tick();
    expect(result).toBe(true);
  }));

  it('redirects to /auth/login when not authenticated', fakeAsync(() => {
    vi.mocked(authMock.isAuthenticated!).mockReturnValue(false);
    let result: any;
    runGuard(authGuard, fakeRoute, fakeState('/dashboard')).subscribe(
      (v: any) => (result = v),
    );
    loadedSubject.next(true);
    tick();
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toContain('/auth/login');
  }));

  it('waits for loaded$ before deciding', fakeAsync(() => {
    vi.mocked(authMock.isAuthenticated!).mockReturnValue(true);
    let emitted = false;
    runGuard(authGuard, fakeRoute, fakeState('/x')).subscribe(() => (emitted = true));
    tick();
    expect(emitted).toBe(false); // still waiting

    loadedSubject.next(true);
    tick();
    expect(emitted).toBe(true);
  }));
});

describe('guestGuard', () => {
  let authMock: Partial<AuthService>;

  beforeEach(() => {
    authMock = {
      isAuthenticated: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authMock }],
    });
  });

  it('allows access when NOT authenticated', () => {
    vi.mocked(authMock.isAuthenticated!).mockReturnValue(false);
    const result = runGuard(guestGuard, fakeRoute, fakeState('/auth/login'));
    expect(result).toBe(true);
  });

  it('redirects to / when already authenticated', () => {
    vi.mocked(authMock.isAuthenticated!).mockReturnValue(true);
    const result = runGuard(guestGuard, fakeRoute, fakeState('/auth/login'));
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });
});
