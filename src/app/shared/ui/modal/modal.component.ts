import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './modal.component.html',
  styles: [
    `:host ::ng-deep .p-dialog-mask {
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      background: rgba(0,0,0,0.35);
      transition: background 260ms ease, backdrop-filter 260ms ease;
    }
    `,
  ],
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

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  @Input() maskBlur = '6px';
  @Input() maskBg = 'rgba(0,0,0,0.35)';

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  imageLoaded = false;
  maskClass = `app-modal-mask-${Math.random().toString(36).slice(2, 9)}`;

  ngOnChanges(changes: SimpleChanges): void {
    if ('gallerySrc' in changes) {
      this.imageLoaded = false;
    }
  }

  ngOnDestroy(): void {}

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

  get contentStyle() {
    return undefined;
  }

  get galleryContentStyle() {
    return { padding: '0', background: 'transparent', overflow: 'visible' };
  }

  get galleryPanelStyle() {
    return {
      background: 'transparent',
      border: 'none',
      'box-shadow': 'none',
      width: this.width,
      'max-width': '98vw',
    };
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onShow() {
    this.visibleChange.emit(true);
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
