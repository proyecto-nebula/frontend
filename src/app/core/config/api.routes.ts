import { environment } from '@env/environment';

const API_URL = environment.apiUrl;

export const API_ROUTES = {
  auth: `${API_URL}/auth`,
  users: `${API_URL}/users`,
  games: `${API_URL}/games`,
  categories: `${API_URL}/categories`,
  favorites: `${API_URL}/favorites`,
  avatars: `${API_URL}/avatars`,
  plans: `${API_URL}/plans`,
  // Agrega aquí el resto de endpoints según tu backend
};
