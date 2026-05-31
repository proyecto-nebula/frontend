import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { adminOnlyGuard } from '@guards/admin-only.guard';
import { editorGuard } from '@guards/editor.guard';
import { AuthService } from '@services/auth.service';

const forbidden = () =>
  import('@shared/error/forbidden/forbidden.page').then(m => m.ForbiddenPage);

const adminGames = () =>
  import('./pages/admin-games/admin-games.page').then(m => m.AdminGamesPage);
const adminCategories = () =>
  import('./pages/admin-categories/admin-categories.page').then(m => m.AdminCategoriesPage);
const adminStudios = () =>
  import('./pages/admin-studios/admin-studios.page').then(m => m.AdminStudiosPage);
const adminAvatars = () =>
  import('./pages/admin-avatars/admin-avatars.page').then(m => m.AdminAvatarsPage);
const adminPlans = () =>
  import('./pages/admin-plans/admin-plans.page').then(m => m.AdminPlansPage);
const adminReports = () =>
  import('./pages/admin-reports/admin-reports.page').then(m => m.AdminReportsPage);
const adminUsers = () =>
  import('./pages/admin-users/admin-users.page').then(m => m.AdminUsersPage);
const adminLogs = () =>
  import('./pages/admin-security-log/admin-security-log.page').then(m => m.AdminSecurityLogPage);

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin.layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: () => {
          const auth = inject(AuthService);
          return auth.isAdmin() ? 'logs' : 'games';
        },
        pathMatch: 'full',
      },

      // ── Editor-only: games ────────────────────────────────────────────
      { path: 'games',     canMatch: [editorGuard], loadComponent: adminGames },
      { path: 'games',     loadComponent: forbidden },
      { path: 'games/new', canMatch: [editorGuard], loadComponent: adminGames },
      { path: 'games/new', loadComponent: forbidden },
      { path: 'games/:id', canMatch: [editorGuard], loadComponent: adminGames },
      { path: 'games/:id', loadComponent: forbidden },

      // ── Editor-only: categories ───────────────────────────────────────
      { path: 'categories',     canMatch: [editorGuard], loadComponent: adminCategories },
      { path: 'categories',     loadComponent: forbidden },
      { path: 'categories/new', canMatch: [editorGuard], loadComponent: adminCategories },
      { path: 'categories/new', loadComponent: forbidden },
      { path: 'categories/:id', canMatch: [editorGuard], loadComponent: adminCategories },
      { path: 'categories/:id', loadComponent: forbidden },

      // ── Editor-only: studios ──────────────────────────────────────────
      { path: 'studios',     canMatch: [editorGuard], loadComponent: adminStudios },
      { path: 'studios',     loadComponent: forbidden },
      { path: 'studios/new', canMatch: [editorGuard], loadComponent: adminStudios },
      { path: 'studios/new', loadComponent: forbidden },
      { path: 'studios/:id', canMatch: [editorGuard], loadComponent: adminStudios },
      { path: 'studios/:id', loadComponent: forbidden },

      // ── Admin-only: avatars ───────────────────────────────────────────
      { path: 'avatars',     canMatch: [adminOnlyGuard], loadComponent: adminAvatars },
      { path: 'avatars',     loadComponent: forbidden },
      { path: 'avatars/new', canMatch: [adminOnlyGuard], loadComponent: adminAvatars },
      { path: 'avatars/new', loadComponent: forbidden },
      { path: 'avatars/:id', canMatch: [adminOnlyGuard], loadComponent: adminAvatars },
      { path: 'avatars/:id', loadComponent: forbidden },

      // ── Editor: plans (moved from admin to editor) ─────────────────────────
      { path: 'plans',     canMatch: [editorGuard], loadComponent: adminPlans },
      { path: 'plans',     loadComponent: forbidden },
      { path: 'plans/new', canMatch: [editorGuard], loadComponent: adminPlans },
      { path: 'plans/new', loadComponent: forbidden },
      { path: 'plans/:id', canMatch: [editorGuard], loadComponent: adminPlans },
      { path: 'plans/:id', loadComponent: forbidden },

      // ── Admin-only: reports ───────────────────────────────────────────
      { path: 'reports',     canMatch: [adminOnlyGuard], loadComponent: adminReports },
      { path: 'reports',     loadComponent: forbidden },
      { path: 'reports/:id', canMatch: [adminOnlyGuard], loadComponent: adminReports },
      { path: 'reports/:id', loadComponent: forbidden },

      // ── Admin-only: users ─────────────────────────────────────────────
      { path: 'users',     canMatch: [adminOnlyGuard], loadComponent: adminUsers },
      { path: 'users',     loadComponent: forbidden },
      { path: 'users/new', canMatch: [adminOnlyGuard], loadComponent: adminUsers },
      { path: 'users/new', loadComponent: forbidden },
      { path: 'users/:id', canMatch: [adminOnlyGuard], loadComponent: adminUsers },
      { path: 'users/:id', loadComponent: forbidden },

      // ── Admin-only: logs (formerly security-log) ──────────────────────
      { path: 'logs', canMatch: [adminOnlyGuard], loadComponent: adminLogs },
      { path: 'logs', loadComponent: forbidden },
    ],
  },
];

