// Modelo alineado con la tabla plans
export interface Plan {
  id: number;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  quality?: string | null;
  gpu?: string | null;
}
