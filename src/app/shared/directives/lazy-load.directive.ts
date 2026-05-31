import { Directive, ElementRef, inject, OnInit } from '@angular/core';

/**
 * Directiva para lazy loading de imágenes.
 * 
 * Uso: <img appLazyLoad [src]="imageUrl" [loading]="'lazy'" />
 * 
 * Beneficios:
 * - Solo carga imágenes cuando entran en viewport
 * - Reduce carga de datos inicial
 * - Mejora Core Web Vitals (LCP, CLS)
 * 
 * Implementación nativa: navegadores modernos usan loading="lazy"
 * Fallback: IntersectionObserver para navegadores antiguos
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit {
  private el = inject(ElementRef<HTMLImageElement>);

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // Si ya tiene loading="lazy", dejar que el navegador lo maneje
    if (img.loading === 'lazy') {
      return;
    }

    // Fallback con IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const imgElement = entry.target as HTMLImageElement;
              imgElement.src = imgElement.dataset['src'] || imgElement.src;
              imgElement.classList.add('loaded');
              observer.unobserve(imgElement);
            }
          });
        },
        { rootMargin: '50px' }, // Precargar 50px antes de entrar
      );
      observer.observe(img);
    } else {
      // Navegadores muy antiguos: cargar inmediatamente
      img.src = img.dataset['src'] || img.src;
    }
  }
}
