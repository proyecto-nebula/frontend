import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { API_ROUTES } from '@config/api.routes';
import { Game } from '@models/game.model';
import { Studio } from '@models/studio.model';
import { Pegi } from '@models/pegi.model';
import { ToastService } from '@ui/toast/toast.service';

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToggleSwitch],
  templateUrl: './games.page.html',
})
export class AdminGamesPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastSvc = inject(ToastService);

  items = signal<Game[]>([]);
  studios = signal<Studio[]>([]);
  pegiList = signal<Pegi[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  previewUrl = signal<string | null>(null);

  private readonly URL_FIELDS = ['coverUrl', 'bannerUrl', 'heroUrl', 'logoUrl'] as const;
  private manuallyEdited = new Set<string>();

  private readonly STEAM_URLS: Record<string, string> = {
    coverUrl:  'https://cdn.akamai.steamstatic.com/steam/apps/{id}/library_600x900_2x.jpg',
    bannerUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/{id}/header.jpg',
    heroUrl:   'https://cdn.akamai.steamstatic.com/steam/apps/{id}/library_hero.jpg',
    logoUrl:   'https://cdn.akamai.steamstatic.com/steam/apps/{id}/logo.png',
  };

  form!: FormGroup;

  ngOnInit(): void {
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

    // Auto-fill image URLs when Steam ID changes
    this.form.get('steamId')!.valueChanges.subscribe(val => {
      if (val) this.autoFillImages(Number(val));
    });

    // Track manual edits on URL fields (only fires when user types, not on programmatic patchValue with emitEvent:false)
    for (const field of this.URL_FIELDS) {
      this.form.get(field)!.valueChanges.subscribe(() => {
        this.manuallyEdited.add(field);
      });
    }

    forkJoin({
      studios: this.http.get<Studio[]>(API_ROUTES.studios).pipe(catchError(() => of([]))),
      pegi: this.http.get<Pegi[]>(API_ROUTES.pegi).pipe(catchError(() => of([]))),
    }).subscribe(({ studios, pegi }) => {
      this.studios.set(studios);
      this.pegiList.set(pegi);
    });

    this.load();
  }

  private autoFillImages(steamId: number): void {
    const patch: Record<string, string> = {};
    for (const field of this.URL_FIELDS) {
      if (!this.manuallyEdited.has(field)) {
        patch[field] = this.STEAM_URLS[field].replace('{id}', String(steamId));
      }
    }
    if (Object.keys(patch).length > 0) {
      this.form.patchValue(patch, { emitEvent: false });
    }
  }

  openPreview(url: string | null | undefined): void {
    if (url) this.previewUrl.set(url);
  }

  load(): void {
    this.http.get<Game[]>(API_ROUTES.games).subscribe(data => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.manuallyEdited.clear();
    this.form.reset({ isActive: true, isFeatured: false }, { emitEvent: false });
    this.showForm.set(true);
  }

  openEdit(item: Game): void {
    this.editingId.set(Number(item.id));
    this.manuallyEdited.clear();
    this.form.patchValue({
      ...item,
      isFeatured: !!item.isFeatured,
      isActive: !!item.isActive,
    }, { emitEvent: false });
    // Treat existing non-empty URL values as manually edited to prevent overwriting
    for (const field of this.URL_FIELDS) {
      const val = this.form.get(field)?.value;
      if (val?.trim()) this.manuallyEdited.add(field);
    }
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const body = {
      ...this.form.value,
      isFeatured: this.form.value.isFeatured ? 1 : 0,
      isActive: this.form.value.isActive ? 1 : 0,
    };
    const req = id
      ? this.http.put(`${API_ROUTES.games}?id=${id}`, body)
      : this.http.post(API_ROUTES.games, body);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.toastSvc.success(id ? 'Juego actualizado' : 'Juego creado');
        this.load();
        this.showForm.set(false);
      },
      error: e => { this.saving.set(false); console.error(e); },
    });
  }

  remove(id: number | string): void {
    if (!confirm('¿Eliminar este juego?')) return;
    this.http.delete(`${API_ROUTES.games}?id=${id}`).subscribe(() => this.load());
  }

  toggleField(id: number | string, field: 'isActive' | 'isFeatured', value: boolean): void {
    const snakeField = field === 'isActive' ? 'is_active' : 'is_featured';
    this.http.patch(`${API_ROUTES.games}?id=${id}`, { [snakeField]: value ? 1 : 0 }).subscribe({
      next: () => {
        this.items.update(list => list.map(g =>
          Number(g.id) === Number(id) ? { ...g, [field]: value } : g
        ));
        this.toastSvc.success('Juego actualizado');
      },
      error: () => this.toastSvc.error('Error al actualizar'),
    });
  }

  viewGame(slug: string | null | undefined): void {
    if (slug) this.router.navigate(['/games', slug]);
  }

  studioName(id: number | string | null | undefined): string {
    return this.studios().find(s => s.id === Number(id))?.name ?? '—';
  }
}
