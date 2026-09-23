/**
 * Contrat de listing produits (MAR-9) : query string partageable ↔ params API.
 * GET /produits et GET /produits/boutique/:id acceptent
 * q, prix_min, prix_max, commune_id, categorie_id + pagination/tri.
 */

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name';
export type FilterStock = 'all' | 'in-stock' | 'out-stock';
export type FilterType = 'all' | 'nouveau' | 'promo' | 'featured';

export interface ProductListingState {
  q: string;
  prixMin: number | null;
  prixMax: number | null;
  communeId: number | null;
  categorieId: number | null;
  categorieSlug: string | null;
  page: number;
  sort: SortKey;
  stock: FilterStock;
  type: FilterType;
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom A-Z' },
];

export const STOCK_OPTIONS: { value: FilterStock; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'in-stock', label: 'En stock' },
  { value: 'out-stock', label: 'Épuisés' },
];

export const TYPE_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'nouveau', label: 'Nouveautés' },
  { value: 'promo', label: 'Promotions' },
  { value: 'featured', label: 'Vedettes' },
];

export const SEARCH_DEBOUNCE_MS = 300;

const SORT_VALUES: SortKey[] = ['recent', 'price-asc', 'price-desc', 'name'];
const STOCK_VALUES: FilterStock[] = ['all', 'in-stock', 'out-stock'];
const TYPE_VALUES: FilterType[] = ['all', 'nouveau', 'promo', 'featured'];

const parsePositiveInt = (raw: string | null): number | null => {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const parseNonNegativeNumber = (raw: string | null): number | null => {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

const parseEnum = <T extends string>(raw: string | null, allowed: T[], fallback: T): T => {
  if (raw && (allowed as string[]).includes(raw)) {
    return raw as T;
  }
  return fallback;
};

const hydrateTypeFromLegacyFlags = (params: URLSearchParams): FilterType => {
  const explicit = params.get('type');
  if (explicit && (TYPE_VALUES as string[]).includes(explicit)) {
    return explicit as FilterType;
  }
  if (params.get('promotion') === 'true') return 'promo';
  if (params.get('nouveaux') === 'true') return 'nouveau';
  if (params.get('featured') === 'true') return 'featured';
  return 'all';
};

export const parseProductListingSearchParams = (
  params: URLSearchParams
): ProductListingState => {
  const rawPage = params.get('page');
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;

  return {
    q: (params.get('q') ?? '').trim(),
    prixMin: parseNonNegativeNumber(params.get('prix_min')),
    prixMax: parseNonNegativeNumber(params.get('prix_max')),
    communeId: parsePositiveInt(params.get('commune_id')),
    categorieId: parsePositiveInt(params.get('categorie_id')),
    categorieSlug: params.get('categorie')?.trim() || null,
    page: Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    sort: parseEnum(params.get('tri'), SORT_VALUES, 'recent'),
    stock: parseEnum(params.get('stock'), STOCK_VALUES, 'all'),
    type: hydrateTypeFromLegacyFlags(params),
  };
};

export const writeProductListingSearchParams = (
  current: URLSearchParams,
  patch: Partial<ProductListingState>
): URLSearchParams => {
  const next = new URLSearchParams(current.toString());
  const state = { ...parseProductListingSearchParams(next), ...patch };

  const setOrDelete = (key: string, value: string | null | undefined) => {
    if (value == null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  };

  setOrDelete('q', state.q.trim() || null);
  setOrDelete('prix_min', state.prixMin != null ? String(state.prixMin) : null);
  setOrDelete('prix_max', state.prixMax != null ? String(state.prixMax) : null);
  setOrDelete('commune_id', state.communeId != null ? String(state.communeId) : null);
  setOrDelete('categorie_id', state.categorieId != null ? String(state.categorieId) : null);
  setOrDelete('categorie', state.categorieSlug);
  setOrDelete('page', state.page > 1 ? String(state.page) : null);
  setOrDelete('tri', state.sort !== 'recent' ? state.sort : null);
  setOrDelete('stock', state.stock !== 'all' ? state.stock : null);
  setOrDelete('type', state.type !== 'all' ? state.type : null);

  next.delete('promotion');
  next.delete('nouveaux');
  next.delete('featured');

  return next;
};

export const mapSortToApi = (sort: SortKey): { tri_par: string; ordre: 'ASC' | 'DESC' } => {
  switch (sort) {
    case 'recent':
      return { tri_par: 'date_creation', ordre: 'DESC' };
    case 'price-asc':
      return { tri_par: 'prix', ordre: 'ASC' };
    case 'price-desc':
      return { tri_par: 'prix', ordre: 'DESC' };
    case 'name':
      return { tri_par: 'nom', ordre: 'ASC' };
    default:
      return { tri_par: 'date_creation', ordre: 'DESC' };
  }
};

export const listingHasActiveFilters = (state: ProductListingState): boolean =>
  state.q.length > 0 ||
  state.prixMin != null ||
  state.prixMax != null ||
  state.communeId != null ||
  state.categorieId != null ||
  !!state.categorieSlug ||
  state.stock !== 'all' ||
  state.type !== 'all';

export const labelForFilterStock = (value: FilterStock): string =>
  STOCK_OPTIONS.find((opt) => opt.value === value)?.label ?? value;

export const labelForFilterType = (value: FilterType): string =>
  TYPE_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
