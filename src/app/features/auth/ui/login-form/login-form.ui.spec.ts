import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
// Import component dynamically in beforeEach so test-setup can resolve external templates first.
import { AuthService } from '@services/auth.service';
import { API_ROUTES } from '@config/api.routes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('LoginFormUi', () => {
  let fixture: any;
  let component: any;
  let LoginFormUi: any;
  let authService: AuthService;
  let http: HttpTestingController;

  beforeEach(async () => {
    const mod = await import('./login-form.ui');
    LoginFormUi = mod.LoginFormUi;

    // After importing the component, ask Angular to resolve component resources
    // (use internal ɵresolveComponentResources if needed) before configuring TestBed.
    try {
      const core: any = await import('@angular/core');
      const resolveFn = core.resolveComponentResources || core.ɵresolveComponentResources || core['ɵresolveComponentResources'];
      if (typeof resolveFn === 'function') {
        // Prefer the global fetch (we polyfill it in test-setup to read local files).
        await resolveFn((globalThis as any).fetch);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Could not run resolveComponentResources from spec:', e && e.message ? e.message : e);
    }

    await TestBed.configureTestingModule({
      imports: [LoginFormUi, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormUi);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    // Flush AuthService constructor session-restore request
    http
      .match(API_ROUTES.users)
      .forEach(req => req.flush(null, { status: 401, statusText: 'Unauthorized' }));
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit button disabled while form is invalid', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn.disabled).toBe(true);
  });

  it('submit button enabled when form is valid', () => {
    component.loginForm.setValue({ email: 'a@b.com', password: 'pass', rememberMe: false });
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn.disabled).toBe(false);
  });

  it('shows error banner on 401', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ status: 401, error: {} })),
    );
    component.loginForm.setValue({ email: 'x@y.com', password: 'wrong', rememberMe: false });

    await component.onSubmit();
    // let microtasks settle
    await Promise.resolve();
    fixture.detectChanges();

    const banner: HTMLElement = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('incorrectos');
  });

  it('shows CORS error on status 0', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ status: 0, error: {} })),
    );
    component.loginForm.setValue({ email: 'x@y.com', password: 'p', rememberMe: false });
    await component.onSubmit();
    await Promise.resolve();
    expect(component.errorMessage()).toContain('CORS');
  });

  it('emits loggedIn on success', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({ token: 'tok' } as any));
    const emitSpy = vi.spyOn(component.loggedIn, 'emit');
    component.loginForm.setValue({ email: 'a@b.com', password: 'p', rememberMe: false });
    await component.onSubmit();
    await Promise.resolve();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('loading resets to false after submit', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({ token: 'tok' } as any));
    component.loginForm.setValue({ email: 'a@b.com', password: 'p', rememberMe: false });
    await component.onSubmit();
    await Promise.resolve();
    expect(component.loading()).toBe(false);
  });

  it('shows server error message for other status codes', async () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ status: 500, error: { message: 'DB error' } })),
    );
    component.loginForm.setValue({ email: 'x@y.com', password: 'p', rememberMe: false });
    await component.onSubmit();
    await Promise.resolve();
    expect(component.errorMessage()).toContain('DB error');
  });
});
