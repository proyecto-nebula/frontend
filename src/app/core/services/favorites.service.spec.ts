import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FavoritesService } from './favorites.service';
import { API_ROUTES } from '@config/api.routes';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(FavoritesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('isFavorite()', () => {
    it('returns true when backend returns data', () => {
      let result: boolean | undefined;
      service.isFavorite(1, 2).subscribe(v => (result = v));

      http.expectOne(`${API_ROUTES.favorites}?user_id=1&game_id=2`).flush({ gameId: 2 });
      expect(result).toBe(true);
    });

    it('returns false on HTTP error', () => {
      let result: boolean | undefined;
      service.isFavorite(1, 99).subscribe(v => (result = v));

      http
        .expectOne(`${API_ROUTES.favorites}?user_id=1&game_id=99`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(result).toBe(false);
    });
  });

  describe('addFavorite()', () => {
    it('POST to favorites endpoint', () => {
      service.addFavorite(1, 5).subscribe();
      const req = http.expectOne(API_ROUTES.favorites);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user_id: 1, game_id: 5 });
      req.flush({ ok: true });
    });

    it('emits on changed$ after add', () => {
      const spy = vi.spyOn(service.changed$, 'next');
      service.addFavorite(1, 5).subscribe();
      http.expectOne(API_ROUTES.favorites).flush({ ok: true });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('removeFavorite()', () => {
    it('DELETE to favorites/{gameId}', () => {
      service.removeFavorite(5).subscribe();
      const req = http.expectOne(`${API_ROUTES.favorites}/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('emits on changed$ after remove', () => {
      const spy = vi.spyOn(service.changed$, 'next');
      service.removeFavorite(5).subscribe();
      http.expectOne(`${API_ROUTES.favorites}/5`).flush(null);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getFavoritesByUser()', () => {
    it('returns array on success', () => {
      let result: any;
      service.getFavoritesByUser(1).subscribe(v => (result = v));
      http
        .expectOne(`${API_ROUTES.favorites}?user_id=1`)
        .flush([{ userId: 1, gameId: 2 }]);
      expect(result).toHaveLength(1);
    });

    it('returns [] on error', () => {
      let result: any;
      service.getFavoritesByUser(1).subscribe(v => (result = v));
      http
        .expectOne(`${API_ROUTES.favorites}?user_id=1`)
        .flush('err', { status: 500, statusText: 'Error' });
      expect(result).toEqual([]);
    });
  });
});
