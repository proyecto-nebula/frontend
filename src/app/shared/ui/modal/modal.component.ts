import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnChanges, OnDestroy {
  @Input() header?: string;
  @Input() width = '420px';
  @Input() modal = true;
  @Input() closable = true;
  @Input() dismissableMask = true;
  @Input() closeOnEscape = true;
  @Input() gallery = false;

  // gallery image inputs
  @Input() gallerySrc: string | null = null;
  @Input() galleryAlt = '';
  @Input() galleryIndex = 0;
  @Input() galleryTotal = 0;

  // gallery video input
  @Input() galleryEmbedUrl: string | null = null;

  private readonly sanitizer = inject(DomSanitizer);

  get safeEmbedUrl(): SafeResourceUrl | null {
    return this.galleryEmbedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(this.galleryEmbedUrl) : null;
  }

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  @Input() maskBlur = '6px';
  @Input() maskBg = 'rgba(0,0,0,0.35)';

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  imageLoaded = false;
  /** Unique class added to the mask so we can find it in the DOM regardless of mode */
  readonly maskClass = `app-modal-mask-${Math.random().toString(36).slice(2, 9)}`;

  private _maskEl: HTMLElement | null = null;
  private _maskDownFn: ((e: MouseEvent) => void) | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('gallerySrc' in changes) {
      this.imageLoaded = false;
    }
  }

  ngOnDestroy(): void {
    this._cleanMaskListener();
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  get showHeader() {
    return !!this.header;
  }

  get activeMaskStyle() {
    return {
      'backdrop-filter': `blur(${this.maskBlur})`,
      '-webkit-backdrop-filter': `blur(${this.maskBlur})`,
      background: this.maskBg,
      transition: 'background 260ms ease, backdrop-filter 260ms ease',
    };
  }

  get galleryContentStyle() {
    return { padding: '0', background: 'transparent', overflow: 'visible' };
  }

  get galleryPanelStyle() {
    return {
      background: 'transparent',
      border: 'none',
      'box-shadow': 'none',
      'max-width': '98vw',
    };
  }

  onHide() {
    this._cleanMaskListener();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onShow(): void {
    this.visibleChange.emit(true);
    if (!this.dismissableMask) return;
    // Wait one tick for appendTo="body" to have rendered the mask in the DOM
    setTimeout(() => {
      // Find the mask via its unique class (works for both gallery and normal mode)
      this._maskEl = document.querySelector<HTMLElement>(`.${this.maskClass}`);
      if (this._maskEl) {
        this._maskDownFn = (e: MouseEvent) => {
          if (this._maskEl && this._maskEl.isSameNode(e.target as Node)) {
            this.onHide();
          }
        };
        this._maskEl.addEventListener('mousedown', this._maskDownFn);
      }
    }, 0);
  }

  private _cleanMaskListener(): void {
    if (this._maskEl && this._maskDownFn) {
      this._maskEl.removeEventListener('mousedown', this._maskDownFn);
    }
    this._maskEl = null;
    this._maskDownFn = null;
  }

  onPrevClick(ev?: Event) {
    ev?.stopPropagation();
    this.prev.emit();
  }

  onNextClick(ev?: Event) {
    ev?.stopPropagation();
    this.next.emit();
  }
}
