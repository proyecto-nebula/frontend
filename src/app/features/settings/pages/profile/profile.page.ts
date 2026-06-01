import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationProfileUi } from '@auth/ui/registration-profile/registration-profile.ui';
import { API_ROUTES } from '@config/api.routes';
import { AuthService } from '@services/auth.service';
import { AvatarsService } from '@services/avatars.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RegistrationProfileUi],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly avatarsService = inject(AvatarsService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = toSignal(this.authService.user$);
  readonly avatars = toSignal(this.avatarsService.list());
  readonly form = signal<FormGroup | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly hasChanges = computed(() => {
    const f = this.form();
    const user = this.currentUser();
    if (!f || !user) return false;
    
    const usernameDirty = f.get('username')?.dirty && f.get('username')?.value !== user.username;
    const avatarDirty = f.get('avatarId')?.dirty && f.get('avatarId')?.value !== user.avatar?.id;
    
    return usernameDirty || avatarDirty;
  });

  ngOnInit() {
    const user = this.currentUser();
    // Inicializar form solo si el usuario está disponible
    if (!user) {
      this.error.set('Usuario no autenticado');
      return;
    }
    
    // Obtener avatar ID - asegurarse de que no sea undefined
    const avatarId = user?.avatar?.id ? Number(user.avatar.id) : null;
    
    this.form.set(
      this.fb.group({
        username: [user?.username ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        avatarId: [avatarId, Validators.required],
      })
    );
  }

  async saveChanges() {
    const f = this.form();
    if (!f || !f.valid) {
      this.error.set('Completa todos los campos correctamente');
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.error.set('Usuario no autenticado');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    try {
      const updateData: any = {};

      // Si el username cambió, incluir en actualización
      if (f.get('username')?.dirty && f.get('username')?.value !== user.username) {
        updateData.username = f.get('username')?.value;
      }

      // Si el avatar cambió, incluir en actualización
      if (f.get('avatarId')?.dirty && f.get('avatarId')?.value !== user.avatar?.id) {
        updateData.avatarId = f.get('avatarId')?.value;
      }

      if (Object.keys(updateData).length === 0) {
        this.error.set('No hay cambios para guardar');
        return;
      }

      await firstValueFrom(
        this.http.patch(`${API_ROUTES.users}/${user.id}`, updateData)
      );

      // Obtener usuario actualizado del servidor
      const updatedUser = await firstValueFrom(this.http.get<any>(`${API_ROUTES.users}`));
      this.authService.setUser(updatedUser);

      this.success.set(true);
      this.error.set(null);
      f.markAsPristine();
    } catch (err: any) {
      this.error.set(err.error?.details || 'Error guardando cambios');
      this.success.set(false);
    } finally {
      this.loading.set(false);
    }
  }
}
