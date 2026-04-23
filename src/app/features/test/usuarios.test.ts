import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, UsuariosResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios-test',
  standalone: true,
  imports: [],
  template: `
    <div class="test-container">
      <h2>Panel de Pruebas: Lista de Usuarios</h2>

      @if (loading()) {
        <p>Cargando usuarios desde el backend...</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Alias</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          @for (user of usuarios(); track user.idUsuario) {
            <tr>
              <td>{{ user.idUsuario }}</td>
              <td>
                <strong>{{ user.alias }}</strong>
              </td>
              <td>{{ user.nombre }} {{ user.apellidos }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.idRol }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="5">No se encontraron usuarios o no tienes permisos.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .test-container {
        padding: 20px;
        font-family: sans-serif;
      }
      .error {
        color: red;
        font-weight: bold;
      }
      th,
      td {
        padding: 10px;
        border: 1px solid #ccc;
      }
      thead {
        background: #eee;
      }
    `,
  ],
})
export class UsuariosTestComponent implements OnInit {
  private http = inject(HttpClient);

  // Usamos Signals para el estado
  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading.set(true);

    // El interceptor añadirá el token automáticamente
    this.http.get<UsuariosResponse>('http://localhost:8000/api/v1/usuarios').subscribe({
      next: res => {
        this.usuarios.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Error al conectar con la API. ¿Estás logueado?');
        this.loading.set(false);
        console.error(err);
      },
    });
  }
}
