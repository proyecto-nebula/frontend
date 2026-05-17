import { Category } from './category.model';
import { Studio } from './studio.model';
import { Pegi } from './pegi.model';
export interface Game {
  id: number | string;
  title: string;
  logoUrl?: string;
  coverUrl: string;
  heroUrl: string;
  bannerUrl?: string;
  developerId?: number | string | null;
  publisherId?: number | string | null;
  pegiId?: number | string | null;
  steamId?: number | null;
  igdbId?: number | null;
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
  pegi?: Pegi | null;
  screenshots?: { thumbUrl: string; imageUrl: string }[];
  // IGDB extended data (only present on view=detail)
  gameModes?: string[];
  gameEngines?: string[];
  multiplayerModes?: string[];
  playerPerspectives?: string[];
  totalRating?: number | null;
  videos?: { videoId: string; name?: string; url: string; embedUrl: string }[];
  websites?: { url: string; type: number }[];
}
