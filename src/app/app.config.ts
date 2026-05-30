import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from '@interceptors/auth.interceptor';
import { cacheInterceptor } from '@interceptors/cache.interceptor';
import { httpErrorInterceptor } from '@interceptors/http-error.interceptor';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([cacheInterceptor, httpErrorInterceptor, authInterceptor])),
    provideAnimationsAsync(),
    // CACHÉ DESACTIVADA — para reactivar: cambiar enabled a !isDevMode()
    provideServiceWorker('ngsw-worker.js', {
      enabled: false,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
  ],
};
