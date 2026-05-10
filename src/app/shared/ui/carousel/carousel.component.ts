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
  styles: [`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }
    .c-track {
      display: flex;
      flex-wrap: nowrap;
      will-change: transform;
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .c-item {
      flex: 0 0 var(--c-item-w, 220px);
      min-width: var(--c-item-w, 220px);
      width: var(--c-item-w, 220px);
      box-sizing: border-box;
    }
    .c-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: #fff;
      font-size: 1.75rem;
      line-height: 1;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      padding: 0;
    }
    .c-btn:hover { background: rgba(0, 0, 0, 0.75); }
    .c-btn-prev { left: 6px; }
    .c-btn-next { right: 6px; }
  `],
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemMinWidth = 220;
  @Input() numScroll = 1;
  @Input() circular = false;
  @Input() showIndicators = false;
  @Input() styleClass?: string;
  /** If provided, overrides the auto-computed numVisible */
  @Input() numVisible?: number;

  @ContentChild(TemplateRef) itemTpl!: TemplateRef<any> | null;

  _numVisible = 1;
  _currentIndex = 0;

  get trackTransform(): string {
    return `translateX(-${this._currentIndex * this.itemMinWidth}px)`;
  }

  get hasPrev(): boolean { return this._currentIndex > 0; }
  get hasNext(): boolean { return this._currentIndex < this._maxIndex; }

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

  get cssItemW(): string { return `${this.itemMinWidth}px`; }

  private _ro?: ResizeObserver;

  constructor(private el: ElementRef, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnChanges(_c: SimpleChanges): void {
    this._clampIndex();
    this._update();
  }

  ngAfterViewInit(): void {
    this._update();
    if (this.numVisible !== undefined) return;
    this._ro = new ResizeObserver(() => {
      const n = this._calc();
      if (n !== this._numVisible) {
        this.zone.run(() => { this._numVisible = n; this._clampIndex(); this.cdr.markForCheck(); });
      }
    });
    this._ro.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void { this._ro?.disconnect(); }

  private _update(): void {
    this._numVisible = this.numVisible !== undefined ? this.numVisible : this._calc();
  }

  private _calc(): number {
    const w = (this.el?.nativeElement as HTMLElement)?.getBoundingClientRect?.()?.width ?? 0;
    if (!w) return this._numVisible || 1;
    return Math.max(1, Math.floor(w / this.itemMinWidth));
  }

  private _clampIndex(): void {
    this._currentIndex = Math.max(0, Math.min(this._currentIndex, this._maxIndex));
  }
}

