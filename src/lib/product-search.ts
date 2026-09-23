export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name';
export type FilterStock = 'all' | 'in-stock' | 'out-stock';
export type FilterType = 'all' | 'nouveau' | 'promo' | 'featured';

export type ProductSearchState = {
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
};

export const SEARCH_DEBOUNCE_MS = 300;

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

export const parsePositiveInt = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const parseNonNegativeNumber = (value: string | null): number | null => {
  if (!value || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const parseProductSearchFromUrl = (
  searchParams: URLSearchParams
): ProductSearchState => {
  const typeFromLegacy =
    searchParams.get('featured') === 'true'
      ? 'featured'
      : searchParams.get('nouveaux') === 'true' || searchParams.get('nouveaux') === '1'
        ? 'nouveau'
        : searchParams.get('promotion') === 'true'
          ? 'promo'
          : null;

  const typeParam = searchParams.get('type');
  const type: FilterType =
    typeParam === 'nouveau' || typeParam === 'promo' || typeParam === 'featured'
      ? typeParam
      : (typeFromLegacy ?? 'all');

  const sortRaw = searchParams.get('tri');
  const sort: SortKey =
    sortRaw === 'price-asc' ||
    sortRaw === 'price-desc' ||
    sortRaw === 'name' ||
    sortRaw === 'recent'
      ? sortRaw
      : 'recent';

  const stockRaw = searchParams.get('stock');
  const stock: FilterStock =
    stockRaw === 'in-stock' || stockRaw === 'out-stock' ? stockRaw : 'all';

  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10);

  return {
    q: (searchParams.get('q') || '').trim(),
    prixMin: parseNonNegativeNumber(searchParams.get('prix_min')),
    prixMax: parseNonNegativeNumber(searchParams.get('prix_max')),
    communeId: parsePositiveInt(searchParams.get('commune_id')),
    categorieId: parsePositiveInt(searchParams.get('categorie_id')),
    categorieSlug: searchParams.get('categorie') || null,
    page: Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1,
    sort,
    stock,
    type,
  };
};

export const writeProductSearchToParams = (
  next: ProductSearchState
): URLSearchParams => {
  const params = new URLSearchParams();

  const setOrSkip = (key: string, value: string | null | undefined) => {
    if (value) params.set(key, value);
  };

  setOrSkip('q', next.q.trim() || null);
  setOrSkip('prix_min', next.prixMin != null ? String(next.prixMin) : null);
  setOrSkip('prix_max', next.prixMax != null ? String(next.prixMax) : null);
  setOrSkip('commune_id', next.communeId != null ? String(next.communeId) : null);
  setOrSkip('categorie_id', next.categorieId != null ? String(next.categorieId) : null);
  setOrSkip('categorie', next.categorieSlug);

  if (next.page > 1) params.set('page', String(next.page));
  if (next.sort !== 'recent') params.set('tri', next.sort);
  if (next.stock !== 'all') params.set('stock', next.stock);
  if (next.type !== 'all') params.set('type', next.type);

  if (next.type === 'featured') params.set('featured', 'true');
  if (next.type === 'nouveau') params.set('nouveaux', 'true');
  if (next.type === 'promo') params.set('promotion', 'true');

  return params;
};

export const mapSortToApi = (
  sort: SortKey
): { tri_par: string; ordre: 'ASC' | 'DESC' } => {
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

export type ApiProduitsQuery = {
  page?: number;
  limite?: number;
  tri_par?: string;
  ordre?: 'ASC' | 'DESC';
  q?: string;
  prix_min?: number;
  prix_max?: number;
  commune_id?: number;
  categorie_id?: number;
  boutique_id?: number;
  featured?: boolean;
  nouveaux?: boolean;
  promotion?: boolean;
  en_stock?: boolean;
};

export const toApiProduitsQuery = (
  state: ProductSearchState,
  extras: { pageSize: number; boutiqueId?: number; categorieId?: number | null }
): ApiProduitsQuery => {
  const { tri_par, ordre } = mapSortToApi(state.sort);
  const categorieId = extras.categorieId ?? state.categorieId;

  const query: ApiProduitsQuery = {
    page: state.page,
    limite: extras.pageSize,
    tri_par,
    ordre,
  };

  if (state.q.trim()) query.q = state.q.trim();
  if (state.prixMin != null) query.prix_min = state.prixMin;
  if (state.prixMax != null) query.prix_max = state.prixMax;
  if (state.communeId != null) query.commune_id = state.communeId;
  if (categorieId != null) query.categorie_id = categorieId;
  if (extras.boutiqueId != null) query.boutique_id = extras.boutiqueId;
  if (state.type === 'featured') query.featured = true;
  if (state.type === 'nouveau') query.nouveaux = true;
  if (state.type === 'promo') query.promotion = true;
  if (state.stock === 'in-stock') query.en_stock = true;
  if (state.stock === 'out-stock') query.en_stock = false;

  return query;
};

export const appendApiProduitsQuery = (
  queryParams: URLSearchParams,
  params: ApiProduitsQuery
) => {
  const append = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined) return;
    queryParams.set(key, String(value));
  };

  append('page', params.page);
  append('limite', params.limite);
  append('tri_par', params.tri_par);
  append('ordre', params.ordre);
  append('q', params.q);
  append('prix_min', params.prix_min);
  append('prix_max', params.prix_max);
  append('commune_id', params.commune_id);
  append('categorie_id', params.categorie_id);
  append('boutique_id', params.boutique_id);
  append('featured', params.featured);
  append('nouveaux', params.nouveaux);
  append('promotion', params.promotion);
  if (params.en_stock !== undefined) {
    queryParams.set('en_stock', params.en_stock ? 'true' : 'false');
  }
};

export const labelForFilterStock = (value: FilterStock): string =>
  STOCK_OPTIONS.find((opt) => opt.value === value)?.label ?? value;

export const labelForFilterType = (value: FilterType): string =>
  TYPE_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
