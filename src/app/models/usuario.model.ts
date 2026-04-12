// src/app/models/usuario.model.ts
export interface Usuario {
  id_usuario: number;
  id_rol: number;
  alias: string;
  nombre: string;
  apellidos: string;
  email: string;
  id_avatar: number;
  id_suscripcion?: string;
  fecha_creacion?: string;
}

export interface AuthResponse {
  result: string;
  token: string;
}

export interface LoginCredentials {
  alias: string;
  password: string;
}

export interface UsuariosResponse {
  result: string;
  items: Usuario[];
}
