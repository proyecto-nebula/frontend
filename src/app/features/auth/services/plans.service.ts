import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@config/api.routes';
import { Plan } from '@models/plan.model';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlansService {
  private http = inject(HttpClient);

  list(): Observable<Plan[]> {
    return this.http
      .get<Plan[] | { plans: Plan[] }>(API_ROUTES.plans)
      .pipe(map((data: any) => (Array.isArray(data) ? data : data.plans || [])));
  }
}
