import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { Plan } from '@models/plan.model';
import { MutationService } from '@services/mutation.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, TableModule],
  templateUrl: './admin-plans.page.html',
})
export class AdminPlansPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mutations = inject(MutationService);

  items = signal<Plan[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);
  viewMode = signal<'list' | 'form'>('list');
  form!: FormGroup;

  readonly qualityOptions = ['720p', '1080p', '4K'];
  readonly gpuOptions = [
    'NVIDIA GeForce RTX 5090',
    'NVIDIA GeForce RTX 5080',
    'NVIDIA GeForce RTX 5070 Ti',
    'NVIDIA GeForce RTX 5070',
    'NVIDIA GeForce RTX 5060 Ti',
    'NVIDIA GeForce RTX 4090',
    'NVIDIA GeForce RTX 4080 Super',
    'NVIDIA GeForce RTX 4080',
    'NVIDIA GeForce RTX 4070 Ti Super',
    'NVIDIA GeForce RTX 4070 Ti',
    'NVIDIA GeForce RTX 4070 Super',
    'NVIDIA GeForce RTX 4070',
    'NVIDIA GeForce RTX 4060 Ti',
    'AMD Radeon RX 9070 XT',
    'AMD Radeon RX 9070',
    'AMD Radeon RX 7900 XTX',
    'AMD Radeon RX 7900 GRE',
    'AMD Radeon RX 7800 XT',
    'AMD Radeon RX 7700 XT',
    'Intel Arc B580',
  ];
  readonly fpsOptions = [30, 60, 120, 144, 240];
  readonly priorityOptions = ['Estándar', 'Prioritario', 'Instantáneo'];
  readonly modsOptions = ['No disponible', 'Básico (Workshop)', 'Avanzado'];
  readonly audioOptions = ['Estéreo 2.0', 'Envolvente 5.1', 'Dolby Atmos 7.1'];

  constructor() {
    // ✅ SUSCRIPCIÓN PERMANENTE: siempre activa
    this.mutations.onMutation('plans').subscribe(() => {
      if (this.viewMode() === 'list') {
        this.loadList();
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isNew = this.router.url.endsWith('/new');
      const planForm = () =>
        this.fb.group({
          name: ['', Validators.required],
          price: [null, [Validators.required, Validators.min(0)]],
          quality: [null],
          gpu: [null],
          fps: [null],
          priority: [null],
          session_limit: [null],
          storage: [null],
          mods: [null],
          audio: [null],
        });
      if (id) {
        this.editingId.set(Number(id));
        this.viewMode.set('form');
        this.form = planForm();
        this.http.get<Plan>(`${API_ROUTES.plans}?id=${id}`).subscribe(item => {
          if (item) this.form.patchValue(item);
        });
      } else if (isNew) {
        this.editingId.set(null);
        this.viewMode.set('form');
        this.form = planForm();
      } else {
        this.editingId.set(null);
        this.viewMode.set('list');
        this.loadList();
        // ✅ Nota: Suscripción permanente ya está en constructor
      }
    });
  }

  loadList(): void {
    this.http.get<Plan[]>(`${API_ROUTES.plans}?cache=false`).subscribe(data => this.items.set(data));
  }

  goCreate(): void {
    this.router.navigate(['/admin/plans/new']);
  }
  goEdit(id: number): void {
    this.router.navigate(['/admin/plans', id]);
  }
  cancel(): void {
    this.router.navigate(['/admin/plans']);
  }

  remove(id: number): void {
    if (!confirm('¿Eliminar este plan?')) return;
    this.http.delete(`${API_ROUTES.plans}?id=${id}`).subscribe(() => this.loadList());
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.plans}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.plans, this.form.value);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/plans']);
      },
      error: e => {
        this.saving.set(false);
        console.error(e);
      },
    });
  }
}
