// Modelo alineado con la API y la base de datos.
// El backend puede devolver campos "planId/roleId/avatarId" planos o
// objetos embebidos `plan`, `role`, `avatar` dependiendo del endpoint.
export interface Role {
  id: number;
  name: string;
}

export interface Plan {
  id: number;
  name: string;
  price?: number | null;
}

export interface Avatar {
  id: number;
  name?: string | null;
  imageUrl?: string | null;
}

export interface User {
  id: number;
  // flat ids (snake_case in backend -> camelCase here)
  planId?: number | null;
  roleId?: number | null;
  avatarId?: number | null;

  // flat image field when backend returns avatar_image
  avatarImage?: string | null;

  // embedded relations (may be present in list endpoints)
  role?: Role | null;
  plan?: Plan | null;
  avatar?: Avatar | null;

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
