import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CarouselComponent } from '@ui/carousel/carousel.component';

@Component({
  selector: 'app-game-videos',
  standalone: true,
  imports: [CommonModule, CarouselComponent],
  templateUrl: './game-videos.ui.html',
})
export class GameVideosUi {
  @Input() videos: { videoId: string; url: string; embedUrl: string }[] | null = null;
  @Output() open = new EventEmitter<number>();

  openVideo(index: number): void {
    this.open.emit(index);
  }

  get videosWithIndex(): { videoId: string; url: string; embedUrl: string; __idx: number }[] {
    return (this.videos ?? []).map((v, i) => ({ ...v, __idx: i }));
  }
}
