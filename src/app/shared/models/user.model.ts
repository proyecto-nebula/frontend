// Modelo alineado con la API y la base de datos
export interface User {
  id: number;
  planId?: number | null;
  roleId?: number | null;
  avatarId?: number | null;
  username: string;
  password?: string;
  token?: string | null;
  email: string;
  birthDate?: string | null;
  lastLoginAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UsersResponse = User[];
