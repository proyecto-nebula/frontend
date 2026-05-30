import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { API_ROUTES } from '@config/api.routes';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { User } from '@models/user.model';

const mockUser: User = { id: 1, name: 'Test', email: 'a@b.com', roleId: 3 } as User;

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('me()', () => {
    it('returns user on success', () => {
      let result: any;
      service.me().subscribe(v => (result = v));
      http.expectOne(API_ROUTES.users).flush(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('returns null on HTTP error', () => {
      let result: any;
      service.me().subscribe(v => (result = v));
      http
        .expectOne(API_ROUTES.users)
        .flush('err', { status: 401, statusText: 'Unauthorized' });
      expect(result).toBeNull();
    });
  });

  describe('getUsers()', () => {
    it('returns array on success', () => {
      let result: any;
      service.getUsers().subscribe(v => (result = v));
      http.expectOne(API_ROUTES.users).flush([mockUser]);
      expect(result).toHaveLength(1);
    });

    it('returns [] on HTTP error', () => {
      let result: any;
      service.getUsers().subscribe(v => (result = v));
      http
        .expectOne(API_ROUTES.users)
        .flush('err', { status: 500, statusText: 'Server Error' });
      expect(result).toEqual([]);
    });
  });
});
