import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { Game } from '@models/game.model';
import { Pegi } from '@models/pegi.model';
import { Studio } from '@models/studio.model';
import { ToastService } from '@ui/toast/toast.service';
import { MutationService } from '@services/mutation.service';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TableModule, ToggleSwitch],
  templateUrl: './admin-games.page.html',
})
export class AdminGamesPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastSvc = inject(ToastService);
  private mutations = inject(MutationService);

  // List
  items = signal<Game[]>([]);
  // Form
  studios = signal<Studio[]>([]);
  pegiList = signal<Pegi[]>([]);
  editingId = signal<number | null>(null);
  returnTo = signal<string | null>(null);
  saving = signal(false);
  previewUrl = signal<string | null>(null);
  viewMode = signal<'list' | 'form'>('list');
  viewOnly = signal(false);

  form!: FormGroup;

  private readonly URL_FIELDS = ['coverUrl', 'bannerUrl', 'heroUrl', 'logoUrl'] as const;
  private manuallyEdited = new Set<string>();
  private readonly STEAM_URLS: Record<string, string> = {
    coverUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/{id}/library_600x900_2x.jpg',
    bannerUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/{id}/header.jpg',
    heroUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/{id}/library_hero.jpg',
    logoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/{id}/logo.png',
  };

  constructor() {
    // ✅ SUSCRIPCIÓN PERMANENTE: siempre activa, no solo cuando ves la lista
    this.mutations.onMutation('games').subscribe(() => {
      console.log('🔄 Evento de mutación recibido en admin-games');
      if (this.viewMode() === 'list') {
        console.log('📋 Modo lista activo, recargando datos...');
        this.loadList();
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isNew = this.router.url.includes('/new');
      const isView = this.route.snapshot.queryParamMap.get('view') === '1';
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      
      this.returnTo.set(returnTo);

      if (id) {
        this.editingId.set(Number(id));
        this.viewOnly.set(isView);
        this.viewMode.set('form');
        this.buildForm();
        this.http.get<Game>(`${API_ROUTES.games}?id=${id}`).subscribe(game => {
          this.form.patchValue(
            { ...game, isFeatured: !!game.isFeatured, isActive: !!game.isActive },
            { emitEvent: false },
          );
          for (const field of this.URL_FIELDS) {
            if (this.form.get(field)?.value?.trim()) this.manuallyEdited.add(field);
          }
          if (isView) this.form.disable();
        });
        this.loadStudiosAndPegi();
      } else if (isNew) {
        this.viewMode.set('form');
        this.buildForm();
        this.loadStudiosAndPegi();
      } else {
        this.editingId.set(null);
        this.viewMode.set('list');
        this.loadList();
        // ✅ Nota: Suscripción permanente ya está en constructor
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      summary: [''],
      description: [''],
      developerId: [null],
      publisherId: [null],
      pegiId: [null],
      steamId: [null],
      igdbId: [null],
      coverUrl: [''],
      bannerUrl: [''],
      heroUrl: [''],
      logoUrl: [''],
      metacriticScore: [null],
      releaseDate: [''],
      publishedAt: [''],
      isFeatured: [false],
      isActive: [true],
    });
    this.form.get('steamId')!.valueChanges.subscribe(val => {
      if (val) this.autoFillImages(Number(val));
    });
    for (const field of this.URL_FIELDS) {
      this.form.get(field)!.valueChanges.subscribe(() => this.manuallyEdited.add(field));
    }
  }

  private loadStudiosAndPegi(): void {
    forkJoin({
      studios: this.http.get<Studio[]>(API_ROUTES.studios).pipe(catchError(() => of([]))),
      pegi: this.http.get<Pegi[]>(API_ROUTES.pegi).pipe(catchError(() => of([]))),
    }).subscribe(({ studios, pegi }) => {
      this.studios.set(studios);
      this.pegiList.set(pegi);
    });
  }

  loadList(): void {
    this.http.get<Game[]>(`${API_ROUTES.games}?all=true`).subscribe(data => this.items.set(data));
  }

  goCreate(): void {
    this.router.navigate(['/admin/games/new']);
  }
  goEdit(id: number | string): void {
    this.router.navigate(['/admin/games', id]);
  }
  goView(id: number | string): void {
    this.router.navigate(['/admin/games', id], { queryParams: { view: '1' } });
  }
  cancel(): void {
    this.router.navigate(['/admin/games']);
  }

  remove(id: number | string): void {
    if (!confirm('¿Eliminar este juego?')) return;
    this.http.delete(`${API_ROUTES.games}?id=${id}`).subscribe(() => {
      this.toastSvc.success('Juego eliminado');
      this.loadList();
    });
  }

  toggleField(id: number | string, field: 'isActive' | 'isFeatured', value: boolean): void {
    const snakeField = field === 'isActive' ? 'is_active' : 'is_featured';
    this.http.patch(`${API_ROUTES.games}?id=${id}`, { [snakeField]: value ? 1 : 0 }).subscribe({
      next: () => {
        this.items.update(list => list.map(g => (Number(g.id) === Number(id) ? { ...g, [field]: value } : g)));
        this.toastSvc.success('Juego actualizado');
      },
      error: () => this.toastSvc.error('Error al actualizar'),
    });
  }

  private autoFillImages(steamId: number): void {
    const patch: Record<string, string> = {};
    for (const field of this.URL_FIELDS) {
      if (!this.manuallyEdited.has(field)) {
        patch[field] = this.STEAM_URLS[field].replace('{id}', String(steamId));
      }
    }
    if (Object.keys(patch).length) this.form.patchValue(patch, { emitEvent: false });
  }

  openPreview(url: string | null | undefined): void {
    if (url) this.previewUrl.set(url);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const body = {
      ...this.form.value,
      isFeatured: this.form.value.isFeatured ? 1 : 0,
      isActive: this.form.value.isActive ? 1 : 0,
    };
    const req = id ? this.http.put(`${API_ROUTES.games}?id=${id}`, body) : this.http.post(API_ROUTES.games, body);
    req.subscribe({
      next: (response: any) => {
        this.saving.set(false);
        this.toastSvc.success(id ? 'Juego actualizado' : 'Juego creado');
        
        // Si es nuevo, redirigir al juego creado. Si es edición, redirigir a returnTo o lista
        if (!id && response?.id) {
          // Nuevo juego: ir a la página del juego
          const slug = response.slug || response.id;
          this.router.navigate(['/games', slug]);
        } else if (id) {
          // Edición: ir a returnTo o lista
          const navigateTo = this.returnTo() || '/admin/games';
          this.router.navigateByUrl(navigateTo);
        } else {
          // Fallback
          this.router.navigate(['/admin/games']);
        }
      },
      error: e => {
        this.saving.set(false);
        console.error(e);
      },
    });
  }
}
