import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './carousel.component.html',
  styles: [`
    :host { display: block; }
    :host ::ng-deep .p-carousel-item { padding: 0 6px; box-sizing: border-box; }
    :host ::ng-deep .p-carousel-item > * { width: 100%; max-width: var(--carousel-item-max-w, 9999px); box-sizing: border-box; }
  `],
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: any[] = [];

  /**
   * Explicit numVisible override.
   * When omitted, numVisible is auto-computed from the container width and itemMinWidth.
   */
  @Input() numVisible?: number;

  /**
   * Minimum width (px) per item used for auto-computing numVisible.
   * Ignored when numVisible is explicitly provided.
   */
  @Input() itemMinWidth = 220;

  @Input() numScroll = 1;
  @Input() circular = false;
  @Input() showIndicators = true;
  @Input() styleClass?: string;

  @ContentChild(TemplateRef) itemTpl!: TemplateRef<any> | null;

  /** Computed or overridden numVisible used by the template. */
  _numVisible = 3;
  _itemMaxW = '9999px';

  private _ro?: ResizeObserver;

  constructor(private el: ElementRef, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('numVisible' in changes || 'itemMinWidth' in changes || 'items' in changes) {
      this._recompute();
    }
  }

  ngAfterViewInit(): void {
    this._recompute();
    if (this.numVisible !== undefined) return; // fixed mode — no observer needed

    this._ro = new ResizeObserver(() => {
      const n = this._compute();
      if (n !== this._numVisible) {
        this.zone.run(() => {
          this._numVisible = n;
          this.cdr.markForCheck();
        });
      }
    });
    this._ro.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this._ro?.disconnect();
  }

  private _recompute(): void {
    const n = this.numVisible !== undefined ? this.numVisible : this._compute();
    if (n !== this._numVisible) this._numVisible = n;
    // cap each item width so items don't grow beyond itemMinWidth
    this._itemMaxW = this.numVisible === undefined ? `${this.itemMinWidth}px` : '9999px';
    (this.el.nativeElement as HTMLElement).style.setProperty(
      '--carousel-item-max-w', this._itemMaxW
    );
  }

  private _compute(): number {
    const w = (this.el?.nativeElement as HTMLElement)?.getBoundingClientRect?.()?.width ?? 0;
    if (!w || !this.itemMinWidth) return this._numVisible;
    const byWidth = Math.max(1, Math.floor(w / this.itemMinWidth));
    // never show more slots than there are items (avoids empty slots)
    const cap = this.items?.length > 0 ? Math.min(byWidth, this.items.length) : byWidth;
    return cap;
  }
}
