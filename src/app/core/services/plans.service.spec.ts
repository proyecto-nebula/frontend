import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PlansService } from './plans.service';
import { API_ROUTES } from '@config/api.routes';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const mockPlan = { id: 1, name: 'Básico', price: 4.99 } as any;

describe('PlansService', () => {
  let service: PlansService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PlansService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('list() returns array when backend returns plain array', () => {
    let result: any;
    service.list().subscribe(v => (result = v));
    http.expectOne(API_ROUTES.plans).flush([mockPlan]);
    expect(result).toEqual([mockPlan]);
  });

  it('list() unwraps { plans: [...] } envelope', () => {
    let result: any;
    service.list().subscribe(v => (result = v));
    http.expectOne(API_ROUTES.plans).flush({ plans: [mockPlan, mockPlan] });
    expect(result).toHaveLength(2);
  });

  it('list() returns [] when envelope has no plans key', () => {
    let result: any;
    service.list().subscribe(v => (result = v));
    http.expectOne(API_ROUTES.plans).flush({});
    expect(result).toEqual([]);
  });
});
