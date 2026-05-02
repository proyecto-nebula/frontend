import { Category } from './category.model';
import { Studio } from './studio.model';
export interface Game {
  id: number | string;
  title: string;
  coverUrl: string;
  bannerUrl?: string;
  developerId?: number | string | null;
  publisherId?: number | string | null;
  pegiId?: number | string | null;
  steamId?: string | null;
  igdbId?: string | null;
  summary?: string | null;
  description?: string | null;
  metacriticScore?: number | string | null;
  releaseDate?: string | null;
  publishedAt?: string | null;
  isFeatured?: boolean | string;
  isActive?: boolean | string;
  slug?: string | null;
  categories?: Category[];
  developer?: Studio | null;
  publisher?: Studio | null;
}
