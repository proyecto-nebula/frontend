import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CarouselComponent } from '@ui/carousel/carousel.component';

@Component({
  selector: 'app-game-screenshots',
  standalone: true,
  imports: [CommonModule, CarouselComponent],
  templateUrl: './game-screenshots.ui.html',
  styles: [`:host { display: block; }`],
})
export class GameScreenshotsUi {
  @Input() screenshots: { thumbUrl: string; imageUrl: string }[] | null = null;
  @Output() open = new EventEmitter<number>();

  openScreenshot(index: number): void {
    console.log('[GameScreenshotsUi] openScreenshot index=', index, 'type=', typeof index);
    this.open.emit(index);
  }

  get screenshotsWithIndex(): ({ thumbUrl: string; imageUrl: string; __idx: number })[] {
    return (this.screenshots ?? []).map((s, i) => ({ ...s, __idx: i }));
  }
}
