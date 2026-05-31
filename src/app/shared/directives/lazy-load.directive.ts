import { Directive, ElementRef, inject, OnInit } from '@angular/core';

/**
 * Directiva para lazy loading de imágenes.
 * 
 * Uso: <img appLazyLoad [src]="imageUrl" />
 * 
 * Beneficios:
 * - Solo carga imágenes cuando entran en viewport
 * - Reduce carga de datos inicial
 * - Mejora Core Web Vitals (LCP, CLS)
 * 
 * Implementación: IntersectionObserver para máximo control
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
})
export class LazyLoadDirective implements OnInit {
  private el = inject(ElementRef<HTMLImageElement>);

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // Usar IntersectionObserver para lazy loading
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const imgElement = entry.target as HTMLImageElement;
              const src = imgElement.dataset['src'] || imgElement.src;
              imgElement.src = src;
              imgElement.classList.add('loaded');
              observer.unobserve(imgElement);
            }
          });
        },
        { rootMargin: '50px' }, // Precargar 50px antes de entrar
      );
      observer.observe(img);
    } else {
      // Fallback para navegadores muy antiguos
      img.src = img.dataset['src'] || img.src;
    }
  }
}
