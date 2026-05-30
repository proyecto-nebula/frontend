import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { API_ROUTES } from '@config/api.routes';
import { User } from '@models/user.model';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@nebula.dev',
  roleId: 3,
} as User;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    // Flush the constructor GET /users (session restore)
    http.expectOne(API_ROUTES.users).flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated() is false when no user', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login() posts credentials and fetches profile', fakeAsync(() => {
    let loginDone = false;

    service.login('test@nebula.dev', 'secret').subscribe(res => {
      expect(res.token).toBe('jwt-token');
      loginDone = true;
    });

    // POST /auth
    const authReq = http.expectOne(API_ROUTES.auth);
    expect(authReq.request.method).toBe('POST');
    expect(authReq.request.body).toEqual({ email: 'test@nebula.dev', password: 'secret' });
    authReq.flush({ token: 'jwt-token' });

    tick(); // let tap() run

    // GET /users (profile fetch inside tap)
    const profileReq = http.expectOne(API_ROUTES.users);
    profileReq.flush(mockUser);

    tick();

    expect(loginDone).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(mockUser);
  }));

  it('isAdmin() returns true for roleId 1', fakeAsync(() => {
    service.login('admin@nebula.dev', 'pass').subscribe();
    http.expectOne(API_ROUTES.auth).flush({ token: 'tok' });
    tick();
    http.expectOne(API_ROUTES.users).flush({ ...mockUser, roleId: 1 });
    tick();
    expect(service.isAdmin()).toBe(true);
  }));

  it('logout() clears user and calls DELETE /auth', () => {
    service.debugSetUser(mockUser);
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();

    const req = http.expectOne(API_ROUTES.auth);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getToken() always returns null (cookie-only auth)', () => {
    expect(service.getToken()).toBeNull();
  });
});
