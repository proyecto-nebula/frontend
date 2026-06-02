import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, OnDestroy, OnInit, NgZone, signal } from '@angular/core';
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
import { AvatarModule } from 'primeng/avatar';

interface NavItem {
  label: string;
  routerLink: string;
  icon?: string;
  styleClass?: string;
  requiresAuth?: boolean;
  onlyForUser?: boolean;
  onlyForAnon?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarModule,
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
  private ngZone = inject(NgZone);

  private hamburgerBtn: HTMLElement | null = null;

  readonly isLoggedIn = computed(() => !!this.auth.user());
  readonly authIsUser = computed(() => this.auth.user()?.roleId === 3);

  constructor() {
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
  searchLoading = signal(false);
  private searchTimer?: ReturnType<typeof setTimeout>;

  // Profile dropdown
  profileMenuOpen = false;

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
    if (event.key === 'Escape') {
      if (this.profileMenuOpen) { this.profileMenuOpen = false; return; }
      if (this.drawerVisible) { this.closeDrawer(); return; }
    }
    if (!this.drawerVisible) return;
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
      if (document.activeElement === first) { event.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  ngOnInit() {
    this.items = [
      { label: 'Descubrir', routerLink: '/discover' },
      { label: 'Próximos lanzamientos', routerLink: '/releases' },
      { label: 'Mis Juegos', routerLink: '/my-games', onlyForUser: true },
      { label: 'Mi suscripción', routerLink: '/settings/plan', requiresAuth: true, onlyForUser: true },
      { label: 'Planes', routerLink: '/plans', onlyForAnon: true },
    ];
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

  logout(): void {
    this.profileMenuOpen = false;
    this.closeDrawer();
    this.closeSearch();
    this.auth.logout();
    this.router.navigate(['/']);
  }

  openLoginModal(): void {
    this.loginModal.open(this.router.url || '/');
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    this.loginModal.close();
    if (this.loginReturnUrl && this.loginReturnUrl !== this.router.url) {
      this.router.navigateByUrl(this.loginReturnUrl);
    }
  }

  // ── Quick search ────────────────────────────────────────────────
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.searchOpen) this.closeSearch();
    if (this.profileMenuOpen) this.profileMenuOpen = false;
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

    this.searchLoading.set(true);
    this.searchTimer = setTimeout(() => {
      this.gameService.searchGames(value).subscribe({
        next: results => {
          this.ngZone.run(() => {
            this.searchResults = results;
            this.searchLoading.set(false);
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.searchLoading.set(false);
          });
        },
      });
    }, 300);
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
  }
}
