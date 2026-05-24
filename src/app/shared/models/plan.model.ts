// Modelo alineado con la tabla plans
export interface Plan {
  id: number;
  name?: string | null;
  price?: number | null;
  quality?: string | null;
  gpu?: string | null;
  fps?: number | null;
  priority?: string | null;
  session_limit?: number | null;
  storage?: number | null;
  mods?: string | null;
  audio?: string | null;
}
