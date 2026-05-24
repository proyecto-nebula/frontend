import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { API_ROUTES } from '@config/api.routes';
import { Studio } from '@models/studio.model';

@Component({
  selector: 'app-admin-studios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './admin-studios.page.html',
})
export class AdminStudiosPage implements OnInit {
  private http   = inject(HttpClient);
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  items     = signal<Studio[]>([]);
  editingId = signal<number | null>(null);
  saving    = signal(false);
  viewMode  = signal<'list' | 'form'>('list');
  form!: FormGroup;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id    = params.get('id');
      const isNew = this.router.url.endsWith('/new');
      if (id) {
        this.editingId.set(Number(id));
        this.viewMode.set('form');
        this.form = this.fb.group({ name: ['', Validators.required] });
        this.http.get<Studio[]>(`${API_ROUTES.studios}?id=${id}`)
          .subscribe(items => { if (items[0]) this.form.patchValue(items[0]); });
      } else if (isNew) {
        this.editingId.set(null);
        this.viewMode.set('form');
        this.form = this.fb.group({ name: ['', Validators.required] });
      } else {
        this.editingId.set(null);
        this.viewMode.set('list');
        this.loadList();
      }
    });
  }

  loadList(): void {
    this.http.get<Studio[]>(API_ROUTES.studios).subscribe(data => this.items.set(data));
  }

  goCreate(): void { this.router.navigate(['/admin/studios/new']); }
  goEdit(id: number): void { this.router.navigate(['/admin/studios', id]); }
  cancel(): void { this.router.navigate(['/admin/studios']); }

  remove(id: number): void {
    if (!confirm('¿Eliminar este estudio?')) return;
    this.http.delete(`${API_ROUTES.studios}?id=${id}`).subscribe(() => this.loadList());
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.studios}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.studios, this.form.value);
    req.subscribe({
      next: () => { this.saving.set(false); this.router.navigate(['/admin/studios']); },
      error: e => { this.saving.set(false); console.error(e); },
    });
  }
}

