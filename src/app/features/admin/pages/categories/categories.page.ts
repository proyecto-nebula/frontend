import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_ROUTES } from '@config/api.routes';

interface CategoryItem { id: number; name: string; imageUrl?: string; }

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.page.html',
})
export class AdminCategoriesPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  items = signal<CategoryItem[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      imageUrl: [''],
    });
    this.load();
  }

  load(): void {
    this.http.get<CategoryItem[]>(API_ROUTES.categories).subscribe(data => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(item: CategoryItem): void {
    this.editingId.set(item.id);
    this.form.patchValue(item);
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.categories}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.categories, this.form.value);
    req.subscribe({ next: () => { this.load(); this.showForm.set(false); }, error: e => console.error(e), complete: () => this.saving.set(false) });
  }

  remove(id: number): void {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.http.delete(`${API_ROUTES.categories}?id=${id}`).subscribe(() => this.load());
  }
}
