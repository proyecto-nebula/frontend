// src/app/core/models/user.model.ts

export interface Role {
  id_rol: number;
  nombre: string;
}

export interface Subscription {
  id_suscripcion: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface Avatar {
  id_avatar: number;
  imagen: string;
}

export interface User {
  id_usuario: number;
  alias: string;
  nombre: string;
  apellidos: string;
  email: string;
  id_rol: number;
  id_suscripcion: number | null;
  fecha_suscripcion: string | null;
  id_avatar: number;
  fecha_creacion: string;
}

/**
 * Mapper profesional: Transforma datos externos en un objeto User.
 * Usamos Record<string, unknown> para evitar el error 'Unexpected any'.
 */
export function mapToUser(data: Record<string, unknown>): User {
  return {
    id_usuario: Number(data['id_usuario'] ?? 0),
    alias: String(data['alias'] ?? ''),
    nombre: String(data['nombre'] ?? ''),
    apellidos: String(data['apellidos'] ?? ''),
    email: String(data['email'] ?? ''),
    id_rol: Number(data['id_rol'] ?? 0),
    id_suscripcion: (data['id_suscripcion'] as number) ?? null,
    fecha_suscripcion: (data['fecha_suscripcion'] as string) ?? null,
    id_avatar: Number(data['id_avatar'] ?? 0),
    fecha_creacion: String(data['fecha_creacion'] ?? ''),
  };
}

// Interfaz para el formulario de login
export interface LoginCredentials {
  alias: string;
  password: string;
}
