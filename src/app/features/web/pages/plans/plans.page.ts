import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlansService } from '@services/plans.service';
import { Plan } from '@models/plan.model';

@Component({
  selector: 'app-web-plans-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plans.page.html',
})
export class PlansPage implements OnInit {
  private plansService = inject(PlansService);
  readonly plans = signal<Plan[]>([]);

  ngOnInit(): void {
    this.plansService.list().subscribe(p => this.plans.set(p));
  }
}
