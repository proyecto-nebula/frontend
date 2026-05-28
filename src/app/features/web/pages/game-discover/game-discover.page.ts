import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { API_ROUTES } from '@config/api.routes';
import { Category } from '@models/category.model';
import { Game } from '@models/game.model';
import { Pegi } from '@models/pegi.model';
import { Studio } from '@models/studio.model';
import { catchError, forkJoin, of } from 'rxjs';

type PublishedPeriod = 'any' | 'year' | 'month' | 'week';

interface DiscoverFilters {
  developerIds: number[];
  publisherIds: number[];
  pegiIds: number[];
  releaseDateMin: number | null;
  releaseDateMax: number | null;
  publishedAtPeriod: PublishedPeriod;
  metacriticMin: number | null;
  metacriticMax: number | null;
  categoryIds: number[];
}

const EMPTY_FILTERS: DiscoverFilters = {
  developerIds: [],
  publisherIds: [],
  pegiIds: [],
  releaseDateMin: null,
  releaseDateMax: null,
  publishedAtPeriod: 'any',
  metacriticMin: null,
  metacriticMax: null,
  categoryIds: [],
};

const PAGE_SIZE = 20;

@Component({
  selector: 'app-game-discover',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './game-discover.page.html',
})
export class GameDiscoverPage implements OnInit {
  private http = inject(HttpClient);

  readonly currentYear = new Date().getFullYear();
  readonly PAGE_SIZE = PAGE_SIZE;

  readonly publishedPeriodOptions: { value: PublishedPeriod; label: string }[] = [
    { value: 'any', label: 'En cualquier momento' },
    { value: 'year', label: 'Este año' },
    { value: 'month', label: 'Este mes' },
    { value: 'week', label: 'Esta semana' },
  ];

  // Raw data
  allGames = signal<Game[]>([]);
  studios = signal<Studio[]>([]);
  pegiList = signal<Pegi[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  sidebarOpen = signal(false);

  // Filter & search state
  filters = signal<DiscoverFilters>({ ...EMPTY_FILTERS });
  searchQuery = signal('');
  currentPage = signal(1);

  // Search within sidebar filter lists
  studioSearch = signal('');
  publisherSearch = signal('');

  constructor() {
    inject(Title).setTitle('Descubrir juegos — Nebula');
  }

  // ── Derived sidebar options ───────────────────────────────────────────────

  /** Only studios that appear as developer_id in at least one game */
  developerStudios = computed(() => {
    const ids = new Set(
      this.allGames()
        .map(g => Number(g.developerId))
        .filter(id => id > 0),
    );
    return this.studios().filter(s => ids.has(s.id));
  });

  /** Only studios that appear as publisher_id in at least one game */
  publisherStudios = computed(() => {
    const ids = new Set(
      this.allGames()
        .map(g => Number(g.publisherId))
        .filter(id => id > 0),
    );
    return this.studios().filter(s => ids.has(s.id));
  });

  filteredStudios = computed(() => {
    const q = this.studioSearch().toLowerCase().trim();
    if (!q) return this.developerStudios();
    return this.developerStudios().filter(s => s.name.toLowerCase().includes(q));
  });

  filteredPublishers = computed(() => {
    const q = this.publisherSearch().toLowerCase().trim();
    if (!q) return this.publisherStudios();
    return this.publisherStudios().filter(s => s.name.toLowerCase().includes(q));
  });

  // ── Filtering pipeline ───────────────────────────────────────────────────

  filteredGames = computed(() => {
    const f = this.filters();

    let publishedAtMin: string | null = null;
    if (f.publishedAtPeriod !== 'any') {
      const d = new Date();
      if (f.publishedAtPeriod === 'week') {
        d.setDate(d.getDate() - 7);
      } else if (f.publishedAtPeriod === 'month') {
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
      } else if (f.publishedAtPeriod === 'year') {
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
      }
      publishedAtMin = d.toISOString().slice(0, 10);
    }

    return this.allGames().filter(g => {
      if (f.developerIds.length && !f.developerIds.includes(Number(g.developerId))) return false;
      if (f.publisherIds.length && !f.publisherIds.includes(Number(g.publisherId))) return false;
      if (f.pegiIds.length && !f.pegiIds.includes(Number(g.pegiId))) return false;

      if (g.releaseDate) {
        const year = new Date(g.releaseDate).getFullYear();
        if (f.releaseDateMin !== null && year < f.releaseDateMin) return false;
        if (f.releaseDateMax !== null && year > f.releaseDateMax) return false;
      } else if (f.releaseDateMin !== null || f.releaseDateMax !== null) {
        return false;
      }

      if (publishedAtMin && (!g.publishedAt || g.publishedAt < publishedAtMin)) return false;

      if (g.metacriticScore !== null && g.metacriticScore !== undefined && g.metacriticScore !== '') {
        const score = Number(g.metacriticScore);
        if (f.metacriticMin !== null && score < f.metacriticMin) return false;
        if (f.metacriticMax !== null && score > f.metacriticMax) return false;
      } else if (f.metacriticMin !== null || f.metacriticMax !== null) {
        return false;
      }

      // OR logic: game must have at least one of the selected categories
      if (f.categoryIds.length) {
        const gameCatIds = (g.categories ?? []).map(c => c.id);
        if (!f.categoryIds.some(id => gameCatIds.includes(id))) return false;
      }

      return true;
    });
  });

  /** filteredGames further narrowed by the inline search box */
  searchedGames = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.filteredGames();
    return this.filteredGames().filter(g => g.title.toLowerCase().includes(q));
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.searchedGames().length / PAGE_SIZE)));

  pagedGames = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * PAGE_SIZE;
    return this.searchedGames().slice(start, start + PAGE_SIZE);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const around = new Set([1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total));
    const pages: number[] = [];
    let prev = 0;
    for (const p of [...around].sort((a, b) => a - b)) {
      if (prev && p - prev > 1) pages.push(0); // 0 = ellipsis marker
      pages.push(p);
      prev = p;
    }
    return pages;
  });

  activeFilterCount = computed(() => {
    const f = this.filters();
    return (
      f.developerIds.length +
      f.publisherIds.length +
      f.pegiIds.length +
      (f.releaseDateMin !== null ? 1 : 0) +
      (f.releaseDateMax !== null ? 1 : 0) +
      (f.publishedAtPeriod !== 'any' ? 1 : 0) +
      (f.metacriticMin !== null ? 1 : 0) +
      (f.metacriticMax !== null ? 1 : 0) +
      f.categoryIds.length
    );
  });

  ngOnInit(): void {
    forkJoin({
      games: this.http.get<Game[]>(`${API_ROUTES.games}?all=true`).pipe(catchError(() => of([]))),
      studios: this.http.get<Studio[]>(API_ROUTES.studios).pipe(catchError(() => of([]))),
      pegi: this.http.get<Pegi[]>(API_ROUTES.pegi).pipe(catchError(() => of([]))),
      categories: this.http.get<Category[]>(API_ROUTES.categories).pipe(catchError(() => of([]))),
    }).subscribe(({ games, studios, pegi, categories }) => {
      this.allGames.set(games);
      this.studios.set(studios.sort((a, b) => a.name.localeCompare(b.name)));
      this.pegiList.set(pegi);
      this.categories.set(categories.sort((a, b) => a.name.localeCompare(b.name)));
      this.isLoading.set(false);
    });
  }

  // ── Filter setters (each resets to page 1) ────────────────────────────────

  toggleDeveloper(id: number): void {
    this.currentPage.set(1);
    this.filters.update(f => ({
      ...f,
      developerIds: f.developerIds.includes(id) ? f.developerIds.filter(x => x !== id) : [...f.developerIds, id],
    }));
  }

  togglePublisher(id: number): void {
    this.currentPage.set(1);
    this.filters.update(f => ({
      ...f,
      publisherIds: f.publisherIds.includes(id) ? f.publisherIds.filter(x => x !== id) : [...f.publisherIds, id],
    }));
  }

  togglePegi(id: number): void {
    this.currentPage.set(1);
    this.filters.update(f => ({
      ...f,
      pegiIds: f.pegiIds.includes(id) ? f.pegiIds.filter(x => x !== id) : [...f.pegiIds, id],
    }));
  }

  toggleCategory(id: number): void {
    this.currentPage.set(1);
    this.filters.update(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter(x => x !== id) : [...f.categoryIds, id],
    }));
  }

  setReleaseMin(val: string): void {
    this.currentPage.set(1);
    this.filters.update(f => ({ ...f, releaseDateMin: val ? parseInt(val, 10) : null }));
  }

  setReleaseMax(val: string): void {
    this.currentPage.set(1);
    this.filters.update(f => ({ ...f, releaseDateMax: val ? parseInt(val, 10) : null }));
  }

  setMetacriticMin(val: string): void {
    this.currentPage.set(1);
    this.filters.update(f => ({ ...f, metacriticMin: val ? parseInt(val, 10) : null }));
  }

  setMetacriticMax(val: string): void {
    this.currentPage.set(1);
    this.filters.update(f => ({ ...f, metacriticMax: val ? parseInt(val, 10) : null }));
  }

  setPublishedPeriod(val: string): void {
    this.currentPage.set(1);
    this.filters.update(f => ({ ...f, publishedAtPeriod: val as PublishedPeriod }));
  }

  setSearchQuery(val: string): void {
    this.currentPage.set(1);
    this.searchQuery.set(val);
  }

  clearFilters(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.searchQuery.set('');
    this.studioSearch.set('');
    this.publisherSearch.set('');
    this.currentPage.set(1);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    document.querySelector('.discover-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getReleaseYear(game: Game): string {
    if (!game.releaseDate) return '—';
    const d = new Date(game.releaseDate);
    return isNaN(d.getTime()) ? '—' : d.getFullYear().toString();
  }

  metacriticClass(score: number | string | null | undefined): string {
    if (score === null || score === undefined || score === '') return '';
    const n = Number(score);
    if (n >= 75) return 'score--high';
    if (n >= 50) return 'score--mid';
    return 'score--low';
  }
}
