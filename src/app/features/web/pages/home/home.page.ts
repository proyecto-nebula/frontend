import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameFeaturedUi } from '@web/ui/game-featured/game-featured.ui';
import { GameCollectionUi } from '@web/ui/game-collection/game-collection.ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, GameFeaturedUi, GameCollectionUi],
  templateUrl: './home.page.html',
})
export class HomePage {}
