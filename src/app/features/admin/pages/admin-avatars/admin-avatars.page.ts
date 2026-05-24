import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { TableModule } from 'primeng/table';

interface AvatarItem {
  id: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-admin-avatars',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  templateUrl: './admin-avatars.page.html',
})
export class AdminAvatarsPage implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  items = signal<AvatarItem[]>([]);
  editingId = signal<number | null>(null);
  saving = signal(false);
  viewMode = signal<'list' | 'form'>('list');
  form!: FormGroup;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      const isNew = this.router.url.endsWith('/new');
      if (id) {
        this.editingId.set(Number(id));
        this.viewMode.set('form');
        this.form = this.fb.group({ name: ['', Validators.required], imageUrl: ['', Validators.required] });
        this.http.get<AvatarItem>(`${API_ROUTES.avatars}?id=${id}`).subscribe(item => {
          if (item) this.form.patchValue(item);
        });
      } else if (isNew) {
        this.editingId.set(null);
        this.viewMode.set('form');
        this.form = this.fb.group({ name: ['', Validators.required], imageUrl: ['', Validators.required] });
      } else {
        this.editingId.set(null);
        this.viewMode.set('list');
        this.loadList();
      }
    });
  }

  loadList(): void {
    this.http.get<AvatarItem[]>(API_ROUTES.avatars).subscribe(data => this.items.set(data));
  }

  goCreate(): void {
    this.router.navigate(['/admin/avatars/new']);
  }
  goEdit(id: number): void {
    this.router.navigate(['/admin/avatars', id]);
  }
  cancel(): void {
    this.router.navigate(['/admin/avatars']);
  }

  remove(id: number): void {
    if (!confirm('¿Eliminar este avatar?')) return;
    this.http.delete(`${API_ROUTES.avatars}?id=${id}`).subscribe(() => this.loadList());
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.http.put(`${API_ROUTES.avatars}?id=${id}`, this.form.value)
      : this.http.post(API_ROUTES.avatars, this.form.value);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/avatars']);
      },
      error: e => {
        this.saving.set(false);
        console.error(e);
      },
    });
  }
}
