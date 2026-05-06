import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-card.html',
  styleUrls: ['./game-card.scss'],
})
export class GameCardComponent {
  @Input() title!: string;
  @Input() coverUrl!: string;
  @Input() slug!: string;
}
