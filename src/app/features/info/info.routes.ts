import { Routes } from '@angular/router';

export const INFO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/info.layout').then(m => m.InfoLayout),
    children: [
      {
        path: 'legal-notice',
        loadComponent: () => import('./pages/legal-notice/legal-notice.page').then(m => m.LegalNoticePage),
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./pages/privacy-policy/privacy-policy.page').then(m => m.PrivacyPolicyPage),
      },
      {
        path: 'cookie-policy',
        loadComponent: () => import('./pages/cookies/cookies.page').then(m => m.CookiesPage),
      },
      {
        path: 'terms-of-service',
        loadComponent: () => import('./pages/terms-of-service/terms-of-service.page').then(m => m.TermsOfServicePage),
      },
      {
        path: 'frequently-asked-questions',
        loadComponent: () =>
          import('./pages/frequently-asked-questions/frequently-asked-questions.page').then(
            m => m.FrequentlyAskedQuestionsPage,
          ),
      },
    ],
  },
];
