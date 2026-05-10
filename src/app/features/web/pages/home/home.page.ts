import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameFeaturedUi } from '@web/ui/game-featured/game-featured.ui';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';
import { WebRegistrationSuccessUi } from '@web/ui/registration-success/registration-success.ui';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameFeaturedUi, GameCollectionUi, WebRegistrationSuccessUi],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  showSuccess = false;
  successUsername?: string | null = null;
  successPlanName?: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.has('registered')) {
      this.showSuccess = true;
      this.successUsername = qp.get('username');
      this.successPlanName = qp.get('planName');
    }
  }
}
