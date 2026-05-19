export interface Report {
  id: number;
  gameId: number;
  userId?: number | null;
  type: 1 | 2 | 3 | 4;
  description?: string | null;
  isSolved: boolean;
  createdAt?: string;
  gameTitle?: string;
  gameSlug?: string;
}
