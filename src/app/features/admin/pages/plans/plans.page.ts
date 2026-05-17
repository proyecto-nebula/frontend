import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { API_ROUTES } from '@config/api.routes';
import { Plan } from '@models/plan.model';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, TableModule],
  templateUrl: './plans.page.html',
})
export class AdminPlansPage implements OnInit {
  private http   = inject(HttpClient);
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  items     = signal<Plan[]>([]);
  editingId = signal<number | null>(null);
  saving    = signal(false);
  viewMode  = signal<'list' | 'form'>('list');
  form!: FormGroup;

  readonly qualityOptions = ['720p', '1080p', '4K'];
  readonly gpuOptions = [
    'NVIDIA GeForce RTX 5090', 'NVIDIA GeForce RTX 5080', 'NVIDIA GeForce RTX 5070 Ti',
    'NVIDIA GeForce RTX 5070', 'NVIDIA GeForce RTX 5060 Ti', 'NVIDIA GeForce RTX 4090',
    'NVIDIA GeForce RTX 4080 Super', 'NVIDIA GeForce RTX 4080', 'NVIDIA GeForce RTX 4070 Ti Super',
    'NVIDIA GeForce RTX 4070 Ti', 'NVIDIA GeForce RTX 4070 Super', 'NVIDIA GeForce RTX 4070',
    'NVIDIA GeForce RTX 4060 Ti', 'AMD Radeon RX 9070 XT', 'AMD Radeon RX 9070',
    'AMD Radeon RX 7900 XTX', 'AMD Radeon RX 7900 GRE', 'AMD Radeon RX 7800 XT',
    'AMD Radeon RX 7700 XT', 'Intel Arc B580',
  ];

  ngOnInit(): void {
    const id    = this.route.snapshot.paramMap.get('id');
    const isNew = this.route.snapshot.url.some(s => s.path === 'new');
    if (id) {
      this.editingId.set(Number(id));
      this.viewMode.set('form');
      this.form = this.fb.group({ name: ['', Validators.required], description: [''], price: [null, [Validators.required, Validators.min(0)]], quality: [null], gpu: [null] });
      this.http.get<Plan[]>(`${API_ROUTES.plans}?id=${id}`)
        .subscribe(items => { if (items[0]) this.form.patchValue(items[0]); });
    } else if (isNew) {
      this.viewMode.set('form');
      this.form = this.fb.group({ name: ['', Validators.required], description: [''], price: [null, [Validators.required, Validators.min(0)]], quality: [null], gpu: [null] });
    } else {
      this.loadList();
    }
  }

  loadList(): void {
    this.http.get<Plan[]>(API_ROUTES.plans).subscribe(data => this.items.set(data));
  }

  goCreate(): void { this.router.navigate(['/admin/plans/new']); }
  goEdit(id: number): void { this.router.navigate(['/admin/plans', id]); }
  cancel(): void { this.router.navigate(['/admin/plans']); }

  remove(id: number): void {
    if (!confirm('¿Eliminar este plan?')) return;
    this.http.delete(`${API_ROUTES.plans}?id=${id}`).subscribe(() => this.loadList());
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.plans}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.plans, this.form.value);
    req.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/admin/plans']); },
      error: e => { this.saving.set(false); console.error(e); },
    });
  }
}

