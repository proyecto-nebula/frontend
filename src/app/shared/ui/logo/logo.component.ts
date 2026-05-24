import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `<img src="logo_nebula.png" alt="Nebula" [class]="imgClass" [style.height]="height" />`,
})
export class LogoComponent {
  @Input() imgClass = '';
  @Input() height = '32px';
}
