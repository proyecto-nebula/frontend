// Modelo alineado con la tabla sessions
export interface Session {
  id: number;
  userId?: number | null;
  gameId?: number | null;
  startedAt?: string | null;
  duration?: number | null;
}
