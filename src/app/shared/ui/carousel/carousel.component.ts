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

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemMinWidth = 220;
  @Input() gap = 0;
  @Input() numScroll = 1;
  @Input() circular = false;
  @Input() showIndicators = false;
  @Input() styleClass?: string;
  @Input() mask = false;
  /** If provided, overrides the auto-computed numVisible */
  @Input() numVisible?: number;

  @ContentChild(TemplateRef) itemTpl!: TemplateRef<any> | null;

  _numVisible = 1;
  _currentIndex = 0;

  // ── Touch drag state ───────────────────────────────────────────────────────
  isDragging = false;
  private _dragOffsetPx = 0;
  private _touchStartX = 0;
  private _touchStartY = 0;
  private _isHorizontalDrag: boolean | null = null;
  private _touchMoveHandler?: (e: Event) => void;
  // ──────────────────────────────────────────────────────────────────────────

  get trackTransform(): string {
    const step = this._getItemPx() + this.gap;
    const base = this._currentIndex * step;
    return `translateX(${-base + this._dragOffsetPx}px)`;
  }

  get hasPrev(): boolean {
    return this._currentIndex > 0;
  }
  get hasNext(): boolean {
    return this._currentIndex < this._maxIndex;
  }

  private get _maxIndex(): number {
    return Math.max(0, this.items.length - this._numVisible);
  }

  prev(): void {
    if (this.hasPrev) {
      this._currentIndex = Math.max(0, this._currentIndex - this.numScroll);
    }
  }

  next(): void {
    if (this.hasNext) {
      this._currentIndex = Math.min(this._maxIndex, this._currentIndex + this.numScroll);
    }
  }

  get cssItemW(): string {
    return `${this.itemMinWidth}px`;
  }

  get cssGap(): string {
    return `${this.gap}px`;
  }

  private _getItemPx(): number {
    const item = (this.el.nativeElement as HTMLElement).querySelector('.c-item') as HTMLElement;
    return item?.offsetWidth || this.itemMinWidth;
  }

  private _ro?: ResizeObserver;

  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(_c: SimpleChanges): void {
    this._clampIndex();
    this._update();
  }

  ngAfterViewInit(): void {
    this._update();
    // Register non-passive touchmove listener so we can prevent default for
    // horizontal drags without triggering the passive-listener warning.
    const overflow = (this.el.nativeElement as HTMLElement).querySelector('.c-overflow') as HTMLElement | null;
    if (overflow) {
      this._touchMoveHandler = (e: Event) => this.onTouchMove(e as TouchEvent);
      overflow.addEventListener('touchmove', this._touchMoveHandler, { passive: false });
    }
    if (this.numVisible !== undefined) return;
    this._ro = new ResizeObserver(() => {
      const n = this._calc();
      if (n !== this._numVisible) {
        this.zone.run(() => {
          this._numVisible = n;
          this._clampIndex();
          this.cdr.markForCheck();
        });
      }
    });
    this._ro.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this._ro?.disconnect();
    const overflow = (this.el.nativeElement as HTMLElement).querySelector('.c-overflow') as HTMLElement | null;
    if (overflow && this._touchMoveHandler) {
      overflow.removeEventListener('touchmove', this._touchMoveHandler);
    }
  }

  private _update(): void {
    this._numVisible = this.numVisible !== undefined ? this.numVisible : this._calc();
  }

  private _calc(): number {
    const w = (this.el?.nativeElement as HTMLElement)?.getBoundingClientRect?.()?.width ?? 0;
    if (!w) return this._numVisible || 1;
    const itemPx = this._getItemPx();
    const step = itemPx + this.gap;
    return Math.max(1, Math.floor((w + this.gap) / step));
  }

  private _clampIndex(): void {
    this._currentIndex = Math.max(0, Math.min(this._currentIndex, this._maxIndex));
  }

  // ── Touch swipe handlers ───────────────────────────────────────────────────
  onTouchStart(e: TouchEvent): void {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._dragOffsetPx = 0;
    this._isHorizontalDrag = null;
    this.isDragging = false;
  }

  onTouchMove(e: TouchEvent): void {
    const dx = e.touches[0].clientX - this._touchStartX;
    const dy = e.touches[0].clientY - this._touchStartY;

    // Determine drag axis on first noticeable movement
    if (this._isHorizontalDrag === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this._isHorizontalDrag = Math.abs(dx) > Math.abs(dy);
    }

    if (!this._isHorizontalDrag) return; // let vertical scroll through

    e.preventDefault(); // block page scroll during horizontal drag
    this.isDragging = true;
    this._dragOffsetPx = dx;
    this.cdr.markForCheck();
  }

  onTouchEnd(): void {
    if (!this.isDragging) {
      this._dragOffsetPx = 0;
      this._isHorizontalDrag = null;
      return;
    }

    const itemW = this._getItemPx() + this.gap;
    // Snap threshold: 25% of an item width triggers a page change
    const threshold = itemW * 0.25;

    if (this._dragOffsetPx < -threshold && this.hasNext) {
      this._currentIndex = Math.min(this._maxIndex, this._currentIndex + this.numScroll);
    } else if (this._dragOffsetPx > threshold && this.hasPrev) {
      this._currentIndex = Math.max(0, this._currentIndex - this.numScroll);
    }

    this._dragOffsetPx = 0;
    this.isDragging = false;
    this._isHorizontalDrag = null;
    this.cdr.markForCheck();
  }
  // ──────────────────────────────────────────────────────────────────────────
}
