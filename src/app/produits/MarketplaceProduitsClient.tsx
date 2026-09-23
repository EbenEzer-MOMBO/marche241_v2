'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { CategoryChips } from '@/components/storefront/CategoryChips';
import { StorefrontCard } from '@/components/storefront/StorefrontCard';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { ProductAdvancedFilters } from '@/components/storefront/ProductAdvancedFilters';
import { CategoryChipsSkeleton, ProductCardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { getProduits } from '@/lib/services/products';
import { getCategoriesPubliques } from '@/lib/services/categories';
import { getCommunesPubliques, type Commune } from '@/lib/services/communes';
import { ProduitDB } from '@/lib/database-types';
import type { Categorie } from '@/lib/database-types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  labelForFilterStock,
  labelForFilterType,
  listingHasActiveFilters,
  mapSortToApi,
  parseProductListingSearchParams,
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
  STOCK_OPTIONS,
  TYPE_OPTIONS,
  writeProductListingSearchParams,
  type FilterStock,
  type FilterType,
  type SortKey,
} from '@/lib/product-listing-query';

const TAILLE_LOT = 12;

type FiltreActif = {
  id: string;
  label: string;
  onRemove: () => void;
};

const filtreChipStyle = {
  borderColor: '#508e27',
  backgroundColor: 'rgba(80,142,39,0.08)',
  color: '#3d6b1c',
};

export default function MarketplaceProduitsClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const listing = parseProductListingSearchParams(searchParams);

  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [communesLoading, setCommunesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [searchDraft, setSearchDraft] = useState(listing.q);
  const [prixMinDraft, setPrixMinDraft] = useState(
    listing.prixMin != null ? String(listing.prixMin) : ''
  );
  const [prixMaxDraft, setPrixMaxDraft] = useState(
    listing.prixMax != null ? String(listing.prixMax) : ''
  );

  const debouncedSearch = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS);
  const debouncedPrixMin = useDebouncedValue(prixMinDraft, SEARCH_DEBOUNCE_MS);
  const debouncedPrixMax = useDebouncedValue(prixMaxDraft, SEARCH_DEBOUNCE_MS);

  const replaceListing = useCallback(
    (patch: Parameters<typeof writeProductListingSearchParams>[1]) => {
      const next = writeProductListingSearchParams(searchParams, patch);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchDraft(listing.q);
  }, [listing.q]);

  useEffect(() => {
    setPrixMinDraft(listing.prixMin != null ? String(listing.prixMin) : '');
  }, [listing.prixMin]);

  useEffect(() => {
    setPrixMaxDraft(listing.prixMax != null ? String(listing.prixMax) : '');
  }, [listing.prixMax]);

  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === listing.q) return;
    replaceListing({ q: nextQ, page: 1 });
  }, [debouncedSearch, listing.q, replaceListing]);

  useEffect(() => {
    const parsed = debouncedPrixMin.trim() === '' ? null : Number(debouncedPrixMin);
    const next = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    if (next === listing.prixMin) return;
    replaceListing({ prixMin: next, page: 1 });
  }, [debouncedPrixMin, listing.prixMin, replaceListing]);

  useEffect(() => {
    const parsed = debouncedPrixMax.trim() === '' ? null : Number(debouncedPrixMax);
    const next = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    if (next === listing.prixMax) return;
    replaceListing({ prixMax: next, page: 1 });
  }, [debouncedPrixMax, listing.prixMax, replaceListing]);

  useEffect(() => {
    let cancelled = false;
    getCategoriesPubliques()
      .then((liste) => {
        if (!cancelled) setCategories(liste);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCommunesLoading(true);
    getCommunesPubliques()
      .then((liste) => {
        if (!cancelled) setCommunes(liste);
      })
      .finally(() => {
        if (!cancelled) setCommunesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProduits = async () => {
      try {
        setLoading(true);
        setError(null);
        const { tri_par, ordre } = mapSortToApi(listing.sort);
        const response = await getProduits({
          page: listing.page,
          limite: pageSize,
          tri_par,
          ordre,
          q: listing.q || undefined,
          prix_min: listing.prixMin ?? undefined,
          prix_max: listing.prixMax ?? undefined,
          commune_id: listing.communeId ?? undefined,
          categorie_id: listing.categorieId ?? undefined,
          featured: listing.type === 'featured' || undefined,
          nouveaux: listing.type === 'nouveau' || undefined,
          promotion: listing.type === 'promo' || undefined,
          en_stock:
            listing.stock === 'in-stock'
              ? true
              : listing.stock === 'out-stock'
                ? false
                : undefined,
        });
        if (cancelled) return;
        setProduits(response.donnees || []);
        setTotalProducts(response.total);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProduits();
    return () => {
      cancelled = true;
    };
  }, [
    listing.page,
    listing.sort,
    listing.q,
    listing.prixMin,
    listing.prixMax,
    listing.communeId,
    listing.categorieId,
    listing.type,
    listing.stock,
    pageSize,
  ]);

  const handleClearAllFilters = useCallback(() => {
    setSearchDraft('');
    setPrixMinDraft('');
    setPrixMaxDraft('');
    replaceListing({
      q: '',
      prixMin: null,
      prixMax: null,
      communeId: null,
      categorieId: null,
      categorieSlug: null,
      page: 1,
      sort: 'recent',
      stock: 'all',
      type: 'all',
    });
  }, [replaceListing]);

  const handleCategoryChipSelect = (id: string) => {
    replaceListing({
      categorieId: id === 'all' ? null : Number(id),
      categorieSlug: null,
      page: 1,
    });
  };

  const handleSortChange = (value: SortKey) => {
    replaceListing({ sort: value, page: 1 });
  };

  const handleFilterStockChange = (value: FilterStock) => {
    replaceListing({ stock: value, page: 1 });
  };

  const handleFilterTypeChange = (value: FilterType) => {
    replaceListing({ type: value, page: 1 });
  };

  const handleCommuneChange = (value: string) => {
    replaceListing({
      communeId: value ? Number(value) : null,
      page: 1,
    });
  };

  const handleVoirPlus = () => {
    setPageSize((size) => size + TAILLE_LOT);
    replaceListing({ page: 1 });
  };

  const categoryChipItems = useMemo(
    () => [
      { id: 'all', label: 'Tout' },
      ...categories.map((categorie) => ({
        id: String(categorie.id),
        label: categorie.nom,
      })),
    ],
    [categories]
  );

  const activeFilterChips = useMemo(() => {
    const chips: FiltreActif[] = [];

    if (listing.categorieId != null) {
      const categorie = categories.find((c) => c.id === listing.categorieId);
      chips.push({
        id: 'categorie',
        label: categorie?.nom ?? `Catégorie #${listing.categorieId}`,
        onRemove: () => replaceListing({ categorieId: null, page: 1 }),
      });
    }

    if (listing.q) {
      chips.push({
        id: 'recherche',
        label: `« ${listing.q} »`,
        onRemove: () => {
          setSearchDraft('');
          replaceListing({ q: '', page: 1 });
        },
      });
    }

    if (listing.prixMin != null || listing.prixMax != null) {
      const minLabel = listing.prixMin != null ? `${listing.prixMin.toLocaleString('fr-FR')}` : '0';
      const maxLabel = listing.prixMax != null ? `${listing.prixMax.toLocaleString('fr-FR')}` : '∞';
      chips.push({
        id: 'prix',
        label: `${minLabel} – ${maxLabel} FCFA`,
        onRemove: () => {
          setPrixMinDraft('');
          setPrixMaxDraft('');
          replaceListing({ prixMin: null, prixMax: null, page: 1 });
        },
      });
    }

    if (listing.communeId != null) {
      const commune = communes.find((c) => c.id === listing.communeId);
      chips.push({
        id: 'commune',
        label: commune?.nom_commune ?? `Commune #${listing.communeId}`,
        onRemove: () => replaceListing({ communeId: null, page: 1 }),
      });
    }

    if (listing.stock !== 'all') {
      chips.push({
        id: 'stock',
        label: labelForFilterStock(listing.stock),
        onRemove: () => handleFilterStockChange('all'),
      });
    }

    if (listing.type !== 'all') {
      chips.push({
        id: 'type',
        label: labelForFilterType(listing.type),
        onRemove: () => handleFilterTypeChange('all'),
      });
    }

    return chips;
  }, [listing, categories, communes, replaceListing]);

  const mobileFilterCount =
    (listing.stock !== 'all' ? 1 : 0) +
    (listing.type !== 'all' ? 1 : 0) +
    (listing.sort !== 'recent' ? 1 : 0) +
    (listing.prixMin != null || listing.prixMax != null ? 1 : 0) +
    (listing.communeId != null ? 1 : 0);

  const hasFilters = listingHasActiveFilters(listing);
  const resteAVoir = Math.max(0, totalProducts - produits.length);
  const prochainLot = Math.min(TAILLE_LOT, resteAVoir);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader activePage="produits" />

      <main className="mx-auto max-w-7xl px-4 pt-[68px] sm:px-8">
        <div className="flex items-end justify-between gap-4 pt-5 pb-4 sm:pt-7">
          <div>
            <h1 className="text-xl font-semibold text-[#17181a] sm:text-2xl">
              Produits du marché
            </h1>
            <p className="mt-1 text-[13px] text-[#5f6369] sm:text-sm">
              {loading ? 'Chargement…' : `${totalProducts} produit${totalProducts > 1 ? 's' : ''}`}
            </p>
          </div>
          <nav aria-label="Fil d'Ariane" className="hidden shrink-0 text-[13px] text-[#9a9892] sm:block">
            <Link href="/" className="transition-colors hover:text-[#17181a]">
              Accueil
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#5f6369]">Produits</span>
          </nav>
        </div>

        {error ? (
          <ErrorState
            title="Impossible de charger les produits"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <div className="hidden items-center gap-4 border-b border-[#ececea] pb-4 sm:flex">
              <div className="relative w-full max-w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9892]" />
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Rechercher un produit..."
                  aria-label="Rechercher un produit"
                  className="h-10 w-full rounded-[9px] border border-[#e0ded9] bg-white pl-9 pr-8 text-[13.5px] text-[#17181a] placeholder:text-[#9a9892] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDraft('');
                      replaceListing({ q: '', page: 1 });
                    }}
                    aria-label="Effacer la recherche"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9a9892] hover:text-[#17181a]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <CategoryChips
                items={categoryChipItems}
                activeId={listing.categorieId != null ? String(listing.categorieId) : 'all'}
                onSelect={handleCategoryChipSelect}
                className="flex-1"
              />

              <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#5f6369]">
                <span>Trier :</span>
                <select
                  value={listing.sort}
                  onChange={(e) => handleSortChange(e.target.value as SortKey)}
                  aria-label="Trier les produits"
                  className="rounded-[9px] border border-[#e0ded9] bg-white px-2.5 py-1.5 text-[13px] text-[#17181a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="hidden border-b border-[#ececea] py-3 sm:block">
              <ProductAdvancedFilters
                prixMin={prixMinDraft}
                prixMax={prixMaxDraft}
                communeId={listing.communeId != null ? String(listing.communeId) : ''}
                communes={communes}
                communesLoading={communesLoading}
                onPrixMinChange={setPrixMinDraft}
                onPrixMaxChange={setPrixMaxDraft}
                onCommuneChange={handleCommuneChange}
              />
            </div>

            <div className="flex flex-col gap-3 pb-4 sm:hidden">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9892]" />
                  <input
                    type="search"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="Rechercher un produit..."
                    aria-label="Rechercher un produit"
                    className="h-10 w-full rounded-[9px] border border-[#e0ded9] bg-white pl-9 pr-8 text-[13.5px] text-[#17181a] placeholder:text-[#9a9892] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFiltresOuverts(true)}
                  aria-label="Ouvrir les filtres"
                  className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#e0ded9] bg-white px-3 text-[13px] font-medium text-[#17181a]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                  {mobileFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#508e27] px-1 font-mono text-[10px] text-white">
                      {mobileFilterCount}
                    </span>
                  )}
                </button>
              </div>
              <CategoryChips
                items={categoryChipItems}
                activeId={listing.categorieId != null ? String(listing.categorieId) : 'all'}
                onSelect={handleCategoryChipSelect}
              />
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-4 pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                  Filtres actifs
                </span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={chip.onRemove}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium"
                    style={filtreChipStyle}
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-[12.5px] font-medium text-[#5f6369] underline underline-offset-2 hover:text-[#17181a]"
                >
                  Tout effacer
                </button>
              </div>
            )}

            <div className="pb-10 pt-2 sm:pb-14">
              {loading && produits.length === 0 ? (
                <div>
                  <Skeleton className="mb-4 h-4 w-32" />
                  <CategoryChipsSkeleton count={4} />
                  <div className="py-6">
                    <ProductCardGridSkeleton count={8} />
                  </div>
                </div>
              ) : produits.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-[15px] text-[#5f6369]">Aucun produit trouvé</p>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="text-[13.5px] font-medium text-[#508e27] underline underline-offset-2"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                    {produits.map((produit) => (
                      <StorefrontCard
                        key={produit.id}
                        boutiqueSlug={produit.boutique?.slug || ''}
                        compactCta
                        produit={produit}
                      />
                    ))}
                  </div>
                  {resteAVoir > 0 && (
                    <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
                      <p className="text-[13px] text-[#8b8f95]">
                        {produits.length} article{produits.length > 1 ? 's' : ''} sur {totalProducts}
                      </p>
                      <ShopCtaButton
                        variant="ghost"
                        fullWidth={false}
                        className="!w-auto px-6"
                        onClick={handleVoirPlus}
                      >
                        Voir les {prochainLot} suivant{prochainLot > 1 ? 's' : ''}
                      </ShopCtaButton>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      {filtresOuverts && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-[rgba(23,24,26,.42)]"
            onClick={() => setFiltresOuverts(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white p-5 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#17181a]">Filtres</h2>
              <button
                type="button"
                onClick={() => setFiltresOuverts(false)}
                aria-label="Fermer les filtres"
                className="text-[#8b8f95] hover:text-[#17181a]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5">
              <ProductAdvancedFilters
                compact
                prixMin={prixMinDraft}
                prixMax={prixMaxDraft}
                communeId={listing.communeId != null ? String(listing.communeId) : ''}
                communes={communes}
                communesLoading={communesLoading}
                onPrixMinChange={setPrixMinDraft}
                onPrixMaxChange={setPrixMaxDraft}
                onCommuneChange={handleCommuneChange}
              />
            </div>
            <div className="mb-5">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Disponibilité
              </h3>
              <div className="flex flex-wrap gap-2">
                {STOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFilterStockChange(opt.value)}
                    className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                    style={
                      listing.stock === opt.value
                        ? { ...filtreChipStyle, border: '1.5px solid #508e27' }
                        : { border: '1px solid #e6e4df', color: '#3c4045' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFilterTypeChange(opt.value)}
                    className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                    style={
                      listing.type === opt.value
                        ? { ...filtreChipStyle, border: '1.5px solid #508e27' }
                        : { border: '1px solid #e6e4df', color: '#3c4045' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Trier par
              </h3>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium"
                    style={
                      listing.sort === opt.value
                        ? { ...filtreChipStyle, border: '1.5px solid #508e27' }
                        : { border: '1px solid #e6e4df', color: '#3c4045' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <ShopCtaButton onClick={() => setFiltresOuverts(false)}>
              Voir les {totalProducts} article{totalProducts > 1 ? 's' : ''}
            </ShopCtaButton>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
