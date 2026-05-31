import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { LoginFormUi } from '@auth/ui/login-form/login-form.ui';
import { LazyLoadDirective } from '@directives/lazy-load.directive';
import { Game } from '@models/game.model';
import { AuthService } from '@services/auth.service';
import { GameService } from '@services/game.service';
import { LoginModalService } from '@services/login-modal.service';
import { LogoComponent } from '@ui/logo/logo.component';
import { ModalComponent } from '@ui/modal/modal.component';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';

interface NavItem extends MenuItem {
  requiresAuth?: boolean;
  /** Mostrar solo a usuarios 'normales' (no Admin/Editor) */
  onlyForUser?: boolean;
  /** Mostrar solo a usuarios anónimos */
  onlyForAnon?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarModule,
    TieredMenuModule,
    ButtonModule,
    LoginFormUi,
    ModalComponent,
    LogoComponent,
    LazyLoadDirective,
  ],
  templateUrl: './header.ui.html',
})
export class HeaderUi implements OnInit, OnDestroy {
  public auth = inject(AuthService);
  private router = inject(Router);
  private loginModal = inject(LoginModalService);
  private gameService = inject(GameService);
  private elRef = inject(ElementRef<HTMLElement>);

  private hamburgerBtn: HTMLElement | null = null;

  constructor() {
    // loginModal subscription created here so takeUntilDestroyed has the injection context.
    this.loginModal.open$.pipe(takeUntilDestroyed()).subscribe(returnUrl => {
      if (returnUrl === null) {
        this.showLoginModal = false;
        this.loginReturnUrl = null;
      } else {
        this.loginReturnUrl = returnUrl || this.router.url || '/';
        this.showLoginModal = true;
      }
    });
  }

  // Quick search
  searchOpen = false;
  searchQuery = '';
  searchResults: Game[] = [];
  searchLoading = false;
  private searchTimer?: ReturnType<typeof setTimeout>;

  // modal state for login
  showLoginModal = false;
  loginReturnUrl: string | null = null;
  drawerVisible = false;
  isScrolled = false;
  items: NavItem[] | undefined;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.drawerVisible) return;
    if (event.key === 'Escape') {
      this.closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    const drawer = this.elRef.nativeElement.querySelector('#mobile-drawer') as HTMLElement | null;
    if (!drawer) return;
    const focusables = (
      Array.from(
        drawer.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ) as HTMLElement[]
    ).filter(el => !el.closest('[aria-hidden="true"]'));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  ngOnInit() {
    this.items = [
      //{ label: 'Inicio', routerLink: '/' },
      { label: 'Descubrir', routerLink: '/discover' },
      { label: 'Próximos lanzamientos', routerLink: '/releases' },
      // Mostrar 'Mis Juegos' solo a usuarios normales (no admin/editor)
      { label: 'Mis Juegos', routerLink: '/my-games', onlyForUser: true },
      // 'Mi suscripción' solo para usuarios normales (no Admin/Editor)
      { label: 'Mi suscripción', routerLink: '/settings/plan', requiresAuth: true, onlyForUser: true },
      // Planes sólo para usuarios anónimos
      { label: 'Planes', routerLink: '/plans', onlyForAnon: true },
    ];
  }

  /**Construir dynamically profile items basado en estado de auth */
  getProfileItems(): MenuItem[] {
    const items: MenuItem[] = [{ label: 'Mi Perfil', icon: 'pi pi-user' }];
    if (this.auth.isUser && this.auth.isUser()) {
      items.push({ label: 'Mi suscripción', icon: 'pi pi-credit-card', routerLink: '/settings/plan' });
    }
    items.push({ label: 'Ajustes', icon: 'pi pi-cog', routerLink: '/settings' });
    items.push({ separator: true });
    items.push({ label: 'Cerrar Sesión', icon: 'pi pi-power-off', command: () => this.logout() });
    return items;
  }

  toggleDrawer(): void {
    if (this.drawerVisible) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer(): void {
    this.hamburgerBtn = this.elRef.nativeElement.querySelector('.hamburger-btn') as HTMLElement | null;
    this.drawerVisible = true;
    setTimeout(() => {
      const drawer = this.elRef.nativeElement.querySelector('#mobile-drawer') as HTMLElement | null;
      const first = drawer?.querySelector(
        'a[href]:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement | null;
      first?.focus();
    }, 50);
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    setTimeout(() => this.hamburgerBtn?.focus(), 50);
  }

  logout() {
    this.auth.logout();
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
      // Debounce completado: hacer búsqueda
      this.gameService.searchGames(value).subscribe({
        next: results => {
          this.searchResults = results;
          this.searchLoading = false;
        },
        error: () => {
          this.searchLoading = false;
        },
      });
    }, 300);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }
}
