import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
// DrawerModule removed: using manual drawer
import { TieredMenuModule } from 'primeng/tieredmenu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarModule, TieredMenuModule, ButtonModule],
  templateUrl: './header.html',
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
      }

      /* Layout for manual header */
      .header-content {
        max-width: 1200px;
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

      /* (old p-drawer styles removed) */
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
        /* gradient left->right: semi-transparent black to transparent */
        background: linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
        color: #fff;
        display: flex;
        align-items: flex-start;
        padding-top: 56px; /* avoid header overlap */
      }
      .drawer-panel.open {
        transform: translateX(0);
      }

      /* Search item: show only icon in center menu */
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
    `,
  ],
})
export class Header implements OnInit {
  public auth = inject(AuthService);
  drawerVisible = false;
  items: MenuItem[] | undefined;
  profileItems: MenuItem[] | undefined;

  ngOnInit() {
    // Items del menú central (se vuelven hamburguesa en móvil)
    this.items = [
      { label: 'Inicio', routerLink: '/' },
      { label: 'Juegos', routerLink: '/games' },
      { label: 'Favoritos', routerLink: '/favoritos' },
      { label: 'Novedades', routerLink: '/novedades' },
      { label: 'Buscar', icon: 'pi pi-search', styleClass: 'menu-search', routerLink: '/search' },
    ];

    // Items del desplegable del avatar
    this.profileItems = [
      { label: 'Mi Perfil', icon: 'pi pi-user' },
      { label: 'Ajustes', icon: 'pi pi-cog' },
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => this.logout(),
      },
    ];
  }

  logout() {
    // Tu lógica para limpiar token y redirigir
  }
}
