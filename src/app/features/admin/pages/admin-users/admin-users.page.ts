import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { User } from '@models/user.model';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { ToastService } from '@ui/toast/toast.service';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { forkJoin } from 'rxjs';

interface PlanOption { id: number; name: string; price?: number | null; }
interface AvatarOption { id: number; name: string; imageUrl: string; }

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule, TableModule, ToggleSwitch, ModalComponent],
  templateUrl: './admin-users.page.html',
})
export class AdminUsersPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastSvc = inject(ToastService);

  items = signal<User[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);
  viewMode = signal<'list' | 'form'>('list');

  // Form metadata
  plans = signal<PlanOption[]>([]);
  avatars = signal<AvatarOption[]>([]);
  selectedAvatarId = signal<number | null>(null);

  // Ban modal
  banVisible = false;
  banTargetId: number | null = null;
  banReason = '';
  banSaving = signal(false);

  readonly roles = [
    { id: 1, name: 'Administrador' },
    { id: 2, name: 'Editor' },
    { id: 3, name: 'Usuario' },
  ];

  form!: FormGroup;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isNew = this.router.url.endsWith('/new');
      if (id) {
        this.editingId.set(Number(id));
        this.viewMode.set('form');
        this.buildForm(false);
        this.loadFormMetadata();
        this.http.get<User>(`${API_ROUTES.users}?id=${id}`).subscribe(user => {
          if (user) {
            const avatarId = (user.avatarId ?? (user.avatar as any)?.id) ?? null;
            this.selectedAvatarId.set(avatarId);
            this.form.patchValue({
              username: user.username,
              email: user.email,
              roleId: user.roleId ?? (user.role as any)?.id,
              planId: user.planId ?? (user.plan as any)?.id ?? null,
              avatarId,
              birthDate: user.birthDate ?? '',
              isActive: !!user.isActive,
            });
          }
        });
      } else if (isNew) {
        this.editingId.set(null);
        this.viewMode.set('form');
        this.buildForm(true);
        this.loadFormMetadata();
      } else {
        this.editingId.set(null);
        this.viewMode.set('list');
        this.loadList();
      }
    });
  }

  buildForm(requirePassword: boolean): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', requirePassword ? Validators.required : []],
      roleId: [3],
      planId: [null],
      avatarId: [null],
      birthDate: [''],
      isActive: [true],
    });
  }

  private loadFormMetadata(): void {
    forkJoin({
      plans: this.http.get<any>(API_ROUTES.plans),
      avatars: this.http.get<AvatarOption[]>(API_ROUTES.avatars),
    }).subscribe(({ plans, avatars }) => {
      const plansArr: PlanOption[] = Array.isArray(plans) ? plans : (plans?.plans ?? []);
      this.plans.set(plansArr);
      this.avatars.set(avatars ?? []);
    });
  }

  selectAvatar(id: number): void {
    const val = id === 0 ? null : id;
    this.selectedAvatarId.set(val);
    this.form.patchValue({ avatarId: val });
  }

  loadList(): void {
    this.http.get<User[]>(`${API_ROUTES.users}?list=1`).subscribe(data => this.items.set(data ?? []));
  }

  goCreate(): void { this.router.navigate(['/admin/users/new']); }
  goEdit(id: number): void { this.router.navigate(['/admin/users', id]); }
  cancel(): void { this.router.navigate(['/admin/users']); }

  remove(id: number): void {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    this.http.delete(`${API_ROUTES.users}?id=${id}`).subscribe({
      next: () => { this.toastSvc.success('Usuario eliminado'); this.loadList(); },
      error: () => this.toastSvc.error('Error al eliminar el usuario'),
    });
  }

  toggleActive(id: number, value: boolean): void {
    const prev = this.items().find(u => u.id === id)?.isActive;
    // optimistic update
    this.items.update(list => list.map(u => u.id === id ? { ...u, isActive: value } : u));
    this.http.patch(`${API_ROUTES.users}?id=${id}`, { isActive: value }).subscribe({
      error: () => {
        // revert on failure
        this.items.update(list => list.map(u => u.id === id ? { ...u, isActive: !!prev } : u));
        this.toastSvc.error('Error al actualizar el estado');
      },
    });
  }

  openBan(id: number): void {
    this.banTargetId = id;
    this.banReason = '';
    this.banVisible = true;
  }

  submitBan(): void {
    if (!this.banTargetId) return;
    this.banSaving.set(true);
    this.http.patch(`${API_ROUTES.users}?id=${this.banTargetId}`, {
      isActive: false,
      banReason: this.banReason,
    }).subscribe({
      next: () => {
        this.banSaving.set(false);
        this.banVisible = false;
        this.toastSvc.success('Usuario baneado correctamente');
        this.loadList();
      },
      error: () => { this.banSaving.set(false); this.toastSvc.error('Error al banear el usuario'); },
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const raw = { ...this.form.value };
    if (!raw.password) delete raw.password;
    const req = id
      ? this.http.patch(`${API_ROUTES.users}?id=${id}`, raw)
      : this.http.post(API_ROUTES.users, raw);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toastSvc.success(id ? 'Usuario actualizado' : 'Usuario creado');
        this.router.navigate(['/admin/users']);
      },
      error: () => { this.saving.set(false); this.toastSvc.error('Error al guardar el usuario'); },
    });
  }
}
