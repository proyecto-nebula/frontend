import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-card.ui.html',
})
export class GameCardUi {
  @Input() title!: string;
  @Input() coverUrl!: string;
  @Input() slug!: string;
}
