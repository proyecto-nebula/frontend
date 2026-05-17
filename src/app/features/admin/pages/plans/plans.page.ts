import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_ROUTES } from '@config/api.routes';
import { Plan } from '@models/plan.model';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plans.page.html',
})
export class AdminPlansPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  items = signal<Plan[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
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

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      quality: [null],
      gpu: [null],
    });
    this.load();
  }

  load(): void {
    this.http.get<Plan[]>(API_ROUTES.plans).subscribe(data => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(item: Plan): void {
    this.editingId.set(item.id);
    this.form.patchValue(item);
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.plans}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.plans, this.form.value);
    req.subscribe({ next: () => { this.load(); this.showForm.set(false); }, error: e => console.error(e), complete: () => this.saving.set(false) });
  }

  remove(id: number): void {
    if (!confirm('¿Eliminar este plan?')) return;
    this.http.delete(`${API_ROUTES.plans}?id=${id}`).subscribe(() => this.load());
  }
}
