import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeStyle, SafeUrl } from '@angular/platform-browser';

@Pipe({ name: 'safe', standalone: true })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, type: 'html' | 'style' | 'url' | 'resourceUrl'): SafeHtml | SafeStyle | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':       return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'url':         return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
  }
}
