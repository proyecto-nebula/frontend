import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GameService } from './game.service';
import { API_ROUTES } from '@config/api.routes';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const mockGame = { id: 1, title: 'Half-Life 3', slug: 'half-life-3' } as any;

describe('GameService', () => {
  let service: GameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(GameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getGames() GET /games', () => {
    let result: any;
    service.getGames().subscribe(v => (result = v));
    http.expectOne(API_ROUTES.games).flush([mockGame]);
    expect(result).toHaveLength(1);
  });

  it('getGameBySlug() encodes slug and passes view=detail', () => {
    service.getGameBySlug('half-life-3').subscribe();
    const req = http.expectOne(
      `${API_ROUTES.games}?slug=half-life-3&view=detail`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockGame);
  });

  it('getGameById() passes id param', () => {
    service.getGameById(1).subscribe();
    const req = http.expectOne(`${API_ROUTES.games}?id=1`);
    req.flush(mockGame);
  });

  it('getRecentlyPublished() passes collection param', () => {
    service.getRecentlyPublished(5).subscribe();
    const req = http.expectOne(r =>
      r.url === API_ROUTES.games &&
      r.params.get('collection') === 'recently_published' &&
      r.params.get('limit') === '5',
    );
    req.flush([mockGame]);
  });

  it('getMostFavorited() passes collection param', () => {
    service.getMostFavorited().subscribe();
    const req = http.expectOne(r =>
      r.url === API_ROUTES.games &&
      r.params.get('collection') === 'most_favorited',
    );
    req.flush([]);
  });

  it('getFavoriteGames() passes user_id', () => {
    service.getFavoriteGames(7).subscribe();
    const req = http.expectOne(r =>
      r.url === API_ROUTES.games &&
      r.params.get('collection') === 'favorites' &&
      r.params.get('user_id') === '7',
    );
    req.flush([mockGame]);
  });

  it('searchGames() returns [] on HTTP error', () => {
    let result: any;
    service.searchGames('xxx').subscribe(v => (result = v));
    http
      .expectOne(r => r.url === API_ROUTES.games && r.params.get('search') === 'xxx')
      .flush('err', { status: 500, statusText: 'Error' });
    expect(result).toEqual([]);
  });
});
