import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { API_ROUTES } from '@config/api.routes';

interface CategoryItem { id: number; name: string; icon?: string; }

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './categories.page.html',
})
export class AdminCategoriesPage implements OnInit {
  private http   = inject(HttpClient);
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  items     = signal<CategoryItem[]>([]);
  editingId = signal<number | null>(null);
  saving    = signal(false);
  viewMode  = signal<'list' | 'form'>('list');
  form!: FormGroup;

  ngOnInit(): void {
    const id    = this.route.snapshot.paramMap.get('id');
    const isNew = this.route.snapshot.url.some(s => s.path === 'new');
    if (id) {
      this.editingId.set(Number(id));
      this.viewMode.set('form');
      this.form = this.fb.group({ name: ['', Validators.required], icon: [''] });
      this.http.get<CategoryItem[]>(`${API_ROUTES.categories}?id=${id}`)
        .subscribe(items => { if (items[0]) this.form.patchValue(items[0]); });
    } else if (isNew) {
      this.viewMode.set('form');
      this.form = this.fb.group({ name: ['', Validators.required], icon: [''] });
    } else {
      this.loadList();
    }
  }

  loadList(): void {
    this.http.get<CategoryItem[]>(API_ROUTES.categories).subscribe(data => this.items.set(data));
  }

  goCreate(): void { this.router.navigate(['/admin/categories/new']); }
  goEdit(id: number): void { this.router.navigate(['/admin/categories', id]); }
  cancel(): void { this.router.navigate(['/admin/categories']); }

  remove(id: number): void {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.http.delete(`${API_ROUTES.categories}?id=${id}`).subscribe(() => this.loadList());
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.categories}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.categories, this.form.value);
    req.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/admin/categories']); },
      error: e => { this.saving.set(false); console.error(e); },
    });
  }
}

