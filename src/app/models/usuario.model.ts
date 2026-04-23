// src/app/models/usuario.model.ts
export interface Usuario {
  idUsuario: number;
  idRol: number;
  alias: string;
  nombre: string;
  apellidos: string;
  email: string;
  idAvatar: number;
  idSuscripcion?: string;
  fechaCreacion?: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  email_usuario: string;
  password_usuario: string;
}

export type UsuariosResponse = Usuario[];
