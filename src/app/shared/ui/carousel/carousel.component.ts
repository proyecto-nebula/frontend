import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  HostBinding,
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
    /* Force fixed item width — p-carousel sets width inline, !important overrides it */
    :host ::ng-deep .p-carousel-item {
      flex: 0 0 var(--carousel-item-w, 220px) !important;
      max-width: var(--carousel-item-w, 220px) !important;
      width: var(--carousel-item-w, 220px) !important;
      box-sizing: border-box;
      padding: 0 6px;
    }
    :host ::ng-deep .p-carousel-item > * { width: 100%; box-sizing: border-box; }
  `],
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: any[] = [];

  /**
   * Override numVisible explicitly. When omitted, computed automatically:
   * numVisible = floor(containerWidth / itemMinWidth).
   */
  @Input() numVisible?: number;

  /** Each item is exactly this many px wide. */
  @Input() itemMinWidth = 220;

  @Input() numScroll = 1;
  @Input() circular = false;
  @Input() showIndicators = true;
  @Input() styleClass?: string;

  @ContentChild(TemplateRef) itemTpl!: TemplateRef<any> | null;

  _numVisible = 1;

  @HostBinding('style.--carousel-item-w')
  get _cssItemW(): string { return `${this.itemMinWidth}px`; }

  private _ro?: ResizeObserver;

  constructor(private el: ElementRef, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnChanges(_c: SimpleChanges): void { this._update(); }

  ngAfterViewInit(): void {
    this._update();
    if (this.numVisible !== undefined) return;
    this._ro = new ResizeObserver(() => {
      const n = this._calc();
      if (n !== this._numVisible) {
        this.zone.run(() => { this._numVisible = n; this.cdr.markForCheck(); });
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
    if (!w) return this._numVisible;
    const byWidth = Math.max(1, Math.floor(w / this.itemMinWidth));
    const cap = this.items?.length > 0 ? Math.min(byWidth, this.items.length) : byWidth;
    return cap;
  }
}

