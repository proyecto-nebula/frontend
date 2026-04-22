import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { MenubarModule } from 'primeng/menubar';
import { TieredMenuModule } from 'primeng/tieredmenu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, AvatarModule, TieredMenuModule],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  public auth = inject(AuthService);
  items: MenuItem[] | undefined;
  profileItems: MenuItem[] | undefined;

  ngOnInit() {
    // Items del menú central (se vuelven hamburguesa en móvil)
    this.items = [
      { label: 'Inicio', icon: 'pi pi-home', routerLink: '/' },
      { label: 'Favoritos', icon: 'pi pi-heart', routerLink: '/favoritos' },
      { label: 'Novedades', icon: 'pi pi-sparkles', routerLink: '/novedades' },
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
