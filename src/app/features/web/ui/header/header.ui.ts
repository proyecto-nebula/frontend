import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginFormComponent } from '@auth/components/login-form/login-form.component';
import { Game } from '@models/game.model';
import { User } from '@models/user.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { LoginModalService } from '@services/login-modal.service';
import { UserService } from '@services/user.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { SharedUiModule } from '../../../../shared/ui/ui.module';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarModule,
    TieredMenuModule,
    ButtonModule,
    LoginFormComponent,
    SharedUiModule,
  ],
  templateUrl: './header.ui.html',
  styles: [
    `
      .header-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1003;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
        color: #fff;
        transition:
          background 1000ms cubic-bezier(0.4, 0, 0.2, 1),
          backdrop-filter 1000ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .header-wrapper.scrolled {
        background: rgba(13, 13, 26, 0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      /* Layout for manual header */
      .header-content {
        max-width: 1800px;
        padding: 0 2rem;
        margin: 0 auto;
        position: relative;
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 8px 12px;
        height: 56px;
        flex-wrap: nowrap;
      }
      .left,
      .center,
      .right {
        display: flex;
        align-items: center;
      }
      .center {
        flex: 1 1 auto;
        justify-content: center;
      }
      .logo-img {
        height: 32px;
      }

      .nav-list {
        display: flex;
        gap: 24px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .nav-link {
        color: #fff;
        text-decoration: none;
        font-weight: 600;
      }
      .nav-icon {
        margin-right: 6px;
      }

      .mobile-hamburger {
        display: none;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.25rem;
        position: relative;
        z-index: 1004; /* above overlay */
      }
      /* mobile-logo is absolutely centered within header-content so it stays on the same line */
      .mobile-logo {
        display: none;
        text-align: center;
        padding: 6px 0;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      @media (max-width: 768px) {
        .nav-list {
          display: none;
        }
        .desktop-logo {
          display: none;
        }
        .mobile-logo {
          display: block;
        }
        .mobile-hamburger {
          display: inline-flex;
        }
        .header-row {
          padding-left: 8px;
          padding-right: 8px;
        }
      }

      /* Drawer list */
      .drawer-list {
        list-style: none;
        padding: 0;
        margin: 0;
        color: #fff;
      }
      .drawer-link {
        text-decoration: none;
        color: inherit;
        display: block;
        padding: 12px 8px;
      }

      /* Overlay and drawer panel (manual) */
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0);
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms ease;
        z-index: 1001;
      }
      .overlay.open {
        background: rgba(0, 0, 0, 0.35);
        opacity: 1;
        pointer-events: auto;
      }

      .drawer-panel {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 260px;
        transform: translateX(-100%);
        transition:
          transform 260ms ease,
          opacity 260ms ease;
        z-index: 1002;
        background: linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
        color: #fff;
        display: flex;
        align-items: flex-start;
        padding-top: 56px; /* avoid header overlap */
      }
      .drawer-panel.open {
        transform: translateX(0);
      }

      .menu-search .nav-text {
        display: none;
      }
      .menu-search .nav-icon {
        display: inline-block;
        color: #fff;
      }
      .nav-item .nav-text {
        color: #fff;
      }
      .nav-link:hover {
        opacity: 0.85;
      }

      /* ── Quick search ───────────────────────────────────────── */
      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
        margin-right: 8px;
      }
      .search-input-wrap {
        overflow: hidden;
        max-width: 0;
        opacity: 0;
        transition: max-width 0.35s ease, opacity 0.25s ease;
      }
      .search-input-wrap.open {
        max-width: 280px;
        opacity: 1;
      }
      .search-input {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: #fff;
        padding: 6px 12px;
        font-size: 0.9rem;
        outline: none;
        width: 260px;
        box-sizing: border-box;
      }
      .search-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      .search-btn {
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 6px 8px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
      }
      .search-btn:hover { opacity: 0.8; }
      .search-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 320px;
        min-height: 60px;
        max-height: 420px;
        overflow-y: auto;
        background: rgba(13, 13, 26, 0.97);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 1010;
      }
      .search-loader {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        color: rgba(255, 255, 255, 0.7);
        font-size: 1.4rem;
        z-index: 1;
      }
      .search-loader.visible {
        opacity: 1;
      }
      .search-results-body {
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }
      .search-results-body.visible {
        opacity: 1;
        pointer-events: auto;
      }
      .search-message {
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.85rem;
      }
      .search-result {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        text-decoration: none;
        transition: background 0.15s;
      }
      .search-result:hover { background: rgba(255, 255, 255, 0.08); }
      .search-result__img {
        width: 72px;
        height: 40px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.05);
      }
      .search-result__img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .search-result__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .search-result__name {
        color: #fff;
        font-size: 0.9rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .search-result__year {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.78rem;
      }
    `,
  ],
})
export class HeaderUi implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private userSvc = inject(UserService);
  private router = inject(Router);
  private loginModal = inject(LoginModalService);
  private gameService = inject(GameService);
  private cdr = inject(ChangeDetectorRef);

  // Quick search
  searchOpen = false;
  searchQuery = '';
  searchResults: Game[] = [];
  searchLoading = false;
  private searchTimer?: ReturnType<typeof setTimeout>;

  /** Offset for the fixed admin bar (48px) shown on web pages for admin users */
  readonly adminBarTop = computed(() => (this.auth.isAdmin() ? 48 : 0));
  // modal state for login
  showLoginModal = false;
  loginReturnUrl: string | null = null;
  drawerVisible = false;
  isScrolled = false;
  items: MenuItem[] | undefined;
  profileItems: MenuItem[] | undefined;
  currentUser: User | null = null;
  currentAvatarUrl: string | null = null;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit() {
    this.items = [
      { label: 'Inicio', routerLink: '/' },
      { label: 'Juegos', routerLink: '/games' },
      { label: 'Mis Juegos', routerLink: '/my-games' },
      { label: 'Novedades', routerLink: '/novedades' },
    ];

    this.profileItems = [
      { label: 'Mi Perfil', icon: 'pi pi-user' },
      { label: 'Mi suscripción', icon: 'pi pi-credit-card', routerLink: '/settings/plan' },
      { label: 'Ajustes', icon: 'pi pi-cog', routerLink: '/settings' },
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => this.logout(),
      },
    ];

    // subscribe to auth user so header updates immediately after login/logout
    this.auth.user$.subscribe(u => {
      this.currentUser = u;
      this.currentAvatarUrl = u?.avatar?.imageUrl ?? null;
      console.log('[HeaderUi] auth.user$', u, 'avatarUrl=', this.currentAvatarUrl, 'token=', this.auth.getToken());
    });

    // subscribe to login modal open requests from other components
    this.loginModal.open$.subscribe(returnUrl => {
      if (returnUrl === null) {
        this.showLoginModal = false;
        this.loginReturnUrl = null;
      } else {
        this.loginReturnUrl = returnUrl || this.router.url || '/';
        this.showLoginModal = true;
      }
    });
  }

  logout() {
    this.auth.logout();
    // Navigate internally to avoid full page reload and the white flash.
    // Components subscribed to `auth.user$` will update reactively.
    this.router.navigate(['/']);
  }

  openLoginModal() {
    this.loginModal.open(this.router.url || '/');
  }

  onLoginSuccess() {
    // close modal; keep user on the same page (header/menu updates reactively)
    this.showLoginModal = false;
    // request-close the modal on the service so subscribers remain in sync
    this.loginModal.close();
    // If a return URL was provided and it's different from current, navigate there.
    if (this.loginReturnUrl && this.loginReturnUrl !== this.router.url) {
      this.router.navigateByUrl(this.loginReturnUrl);
    }
  }

  // ── Quick search ────────────────────────────────────────────────
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.searchOpen) this.closeSearch();
  }

  toggleSearch(): void {
    if (this.searchOpen) {
      this.closeSearch();
    } else {
      this.searchOpen = true;
      this.searchQuery = '';
      this.searchResults = [];
      setTimeout(() => document.querySelector<HTMLInputElement>('.search-input')?.focus(), 50);
    }
  }

  closeSearch(): void {
    this.searchOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    clearTimeout(this.searchTimer);
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.searchResults = [];
    clearTimeout(this.searchTimer);
    if (value.length < 3) return;
    this.searchLoading = true;
    this.searchTimer = setTimeout(() => {
      this.gameService.searchGames(value).subscribe({
        next: results => { this.searchResults = results; this.searchLoading = false; this.cdr.markForCheck(); },
        error: () => { this.searchLoading = false; this.cdr.markForCheck(); },
      });
    }, 300);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }
}
