import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CarouselComponent } from '@ui/carousel/carousel.component';

type VideoItem = { kind: 'video'; videoId: string; name?: string; url: string; embedUrl: string; __idx: number };
type ScreenshotItem = { kind: 'screenshot'; thumbUrl: string; imageUrl: string; __idx: number };
export type MediaItem = VideoItem | ScreenshotItem;

@Component({
  selector: 'app-game-screenshots',
  standalone: true,
  imports: [CommonModule, CarouselComponent],
  templateUrl: './game-screenshots.ui.html',
})
export class GameScreenshotsUi {
  @Input() screenshots: { thumbUrl: string; imageUrl: string }[] | null = null;
  @Input() videos: { videoId: string; name?: string; url: string; embedUrl: string }[] | null = null;
  @Output() open = new EventEmitter<{ type: 'screenshot' | 'video'; index: number }>();

  openItem(item: MediaItem): void {
    if (item.kind === 'video') {
      this.open.emit({ type: 'video', index: item.__idx });
    } else {
      this.open.emit({ type: 'screenshot', index: item.__idx });
    }
  }

  get mediaItems(): MediaItem[] {
    const items: MediaItem[] = [];
    const vids = this.videos ?? [];
    if (vids.length > 0) {
      const trailerIdx = vids.findIndex(v => v.name && v.name.toLowerCase().includes('trailer'));
      const chosenIdx = trailerIdx >= 0 ? trailerIdx : 0;
      items.push({ kind: 'video', ...vids[chosenIdx], __idx: chosenIdx });
    }
    (this.screenshots ?? []).forEach((s, i) => items.push({ kind: 'screenshot', ...s, __idx: i }));
    return items;
  }
}
