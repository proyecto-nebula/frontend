import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopGamesPanelComponent } from './components/top-games-panel/top-games.panel';
import { ActiveUsersPanelComponent } from './components/active-users-panel/active-users.panel';
import { PendingReportsPanelComponent } from './components/pending-reports-panel/pending-reports.panel';
import { FavoriteGamesPanelComponent } from './components/favorite-games-panel/favorite-games.panel';
import { TopCategoriesPanelComponent } from './components/top-categories-panel/top-categories.panel';
import { FavoriteCategoriesPanelComponent } from './components/favorite-categories-panel/favorite-categories.panel';
import { TopStudiosPanelComponent } from './components/top-studios-panel/top-studios.panel';
import { PegiDistributionPanelComponent } from './components/pegi-distribution-panel/pegi-distribution.panel';
import { PlanDistributionPanelComponent } from './components/plan-distribution-panel/plan-distribution.panel';
import { SessionStatsPanelComponent } from './components/session-stats-panel/session-stats.panel';
import { RetentionRatePanelComponent } from './components/retention-rate-panel/retention-rate.panel';
import { PlatformOverviewPanelComponent } from './components/platform-overview-panel/platform-overview.panel';
import { NewUsersPanelComponent } from './components/new-users-panel/new-users.panel';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopGamesPanelComponent,
    ActiveUsersPanelComponent,
    PendingReportsPanelComponent,
    FavoriteGamesPanelComponent,
    TopCategoriesPanelComponent,
    FavoriteCategoriesPanelComponent,
    TopStudiosPanelComponent,
    PegiDistributionPanelComponent,
    PlanDistributionPanelComponent,
    SessionStatsPanelComponent,
    RetentionRatePanelComponent,
    PlatformOverviewPanelComponent,
    NewUsersPanelComponent,
  ],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage {}
