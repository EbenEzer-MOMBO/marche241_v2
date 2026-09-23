'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useBoutique } from '@/hooks/useBoutique';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { getProduitsParBoutique } from '@/lib/services/products';
import { ProduitDB } from '@/lib/database-types';
import type { Categorie } from '@/lib/database-types';
import { CategoryChipsSkeleton, ProductCardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { CategoryChips } from '@/components/storefront/CategoryChips';
import { StorefrontCard } from '@/components/storefront/StorefrontCard';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { ProductAdvancedFilters } from '@/components/storefront/ProductAdvancedFilters';
import { produitHasRequiredVariants } from '@/lib/utils/shop-theme';
import { getCommunesActives, type Commune } from '@/lib/services/communes';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  listingHasActiveFilters,
  labelForFilterStock,
  labelForFilterType,
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
import { Search, SlidersHorizontal, X } from 'lucide-react';

/** Catégorie affichée dans le filtre, dérivée de l’ensemble des produits boutique (comptage exact) */
type CategorieAvecCompte = {
  id: number;
  nom: string;
  slug: string;
  count: number;
};

type FiltreActif = {
  id: string;
  label: string;
  onRemove: () => void;
};

const CHUNK_FETCH_META = 100;
const MAX_PAGES_META = 500;
const TAILLE_LOT = 12;

/** Parcourt toutes les pages produits pour reconstruire catégories + effectifs (comme l’ancienne page en un seul chargement) */
const fetchAllProduitsPourCategories = async (boutiqueId: number): Promise<ProduitDB[]> => {
  const all: ProduitDB[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getProduitsParBoutique(boutiqueId, {
      page,
      limite: CHUNK_FETCH_META,
      tri_par: 'date_creation',
      ordre: 'DESC',
    });
    all.push(...(response.donnees || []));
    totalPages = Math.max(1, response.total_pages);
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES_META);

  return all;
};

const buildCategoriesFromProduits = (produitsSource: ProduitDB[]): CategorieAvecCompte[] => {
  const countById = new Map<number, number>();
  const categorieById = new Map<number, Categorie>();
  const ordreIds: number[] = [];
  const seenId = new Set<number>();

  for (const p of produitsSource) {
    if (!p.categorie) continue;
    const id = p.categorie.id;
    categorieById.set(id, p.categorie);
    countById.set(id, (countById.get(id) ?? 0) + 1);
    if (!seenId.has(id)) {
      seenId.add(id);
      ordreIds.push(id);
    }
  }

  return ordreIds.map((id) => {
    const cat = categorieById.get(id)!;
    return {
      id,
      nom: cat.nom,
      slug: cat.slug,
      count: countById.get(id) ?? 0,
    };
  });
};

const dateProduitVersNombre = (p: ProduitDB): number => {
  const d = p.date_creation;
  if (d instanceof Date) return d.getTime();
  if (typeof d === 'string') return new Date(d).getTime();
  return 0;
};

const trierProduitsClient = (list: ProduitDB[], sort: SortKey): ProduitDB[] => {
  const copie = [...list];
  switch (sort) {
    case 'recent':
      copie.sort(
        (a, b) =>
          dateProduitVersNombre(b) - dateProduitVersNombre(a) || b.id - a.id
      );
      break;
    case 'price-asc':
      copie.sort((a, b) => a.prix - b.prix);
      break;
    case 'price-desc':
      copie.sort((a, b) => b.prix - a.prix);
      break;
    case 'name':
      copie.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      break;
    default:
      break;
  }
  return copie;
};

const filtreChipStyle = {
  borderColor: 'var(--color-shop-primary, var(--primary-color))',
  backgroundColor: 'var(--shop-primary-tint)',
  color: 'var(--shop-primary-dark)',
};

export default function ProduitsPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const boutiqueName = params.boutique as string;

  const listing = parseProductListingSearchParams(searchParams);
  const currentPage = listing.page;
  const selectedCategorieSlug = listing.categorieSlug;
  const sortBy = listing.sort;
  const filterStock = listing.stock;
  const filterType = listing.type;

  const { boutique, loading: boutiqueLoading, error: boutiqueError } = useBoutique(boutiqueName);
  const { ajouterProduit, loading: adding } = useAjoutPanier();
  const { success, error: showError, toasts, removeToast } = useToast();

  const [produits, setProduits] = useState<ProduitDB[]>([]);
  /** Catalogue complet boutique (agrégation API) : catégories + pagination filtrée côté client */
  const [catalogueComplet, setCatalogueComplet] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<CategorieAvecCompte[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(listing.q);
  const [prixMinDraft, setPrixMinDraft] = useState(
    listing.prixMin != null ? String(listing.prixMin) : ''
  );
  const [prixMaxDraft, setPrixMaxDraft] = useState(
    listing.prixMax != null ? String(listing.prixMax) : ''
  );
  const [pageSize, setPageSize] = useState(24);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [communesLoading, setCommunesLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

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

  const replaceSearchParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
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

  const setPageInUrl = useCallback(
    (page: number) => {
      replaceSearchParams((p) => {
        if (page <= 1) {
          p.delete('page');
        } else {
          p.set('page', String(page));
        }
      });
    },
    [replaceSearchParams]
  );

  const handleResetPageInUrl = useCallback(() => {
    replaceSearchParams((p) => {
      p.delete('page');
    });
  }, [replaceSearchParams]);

  // Catégories + effectifs : même logique qu’avant (dérivés des produits), mais en chargeant toutes les pages API en arrière-plan
  useEffect(() => {
    if (!boutique?.id) return;

    let cancelled = false;

    const run = async () => {
      try {
        setCategoriesLoading(true);
        const allProduits = await fetchAllProduitsPourCategories(boutique.id);
        if (cancelled) return;
        setCatalogueComplet(allProduits);
        setCategories(buildCategoriesFromProduits(allProduits));
      } catch (err) {
        console.error('Erreur lors du chargement des catégories (agrégation produits):', err);
        if (!cancelled) {
          setCatalogueComplet([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [boutique?.id]);

  useEffect(() => {
    if (!boutique?.id) return;
    let cancelled = false;
    setCommunesLoading(true);
    getCommunesActives(boutique.id)
      .then((liste) => {
        if (!cancelled) setCommunes(liste);
      })
      .catch(() => {
        if (!cancelled) setCommunes([]);
      })
      .finally(() => {
        if (!cancelled) setCommunesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boutique?.id]);

  const selectedCategorieId = useMemo(() => {
    if (listing.categorieId) return listing.categorieId;
    if (!selectedCategorieSlug) return undefined;
    return categories.find((c) => c.slug === selectedCategorieSlug)?.id;
  }, [listing.categorieId, selectedCategorieSlug, categories]);

  const hasShareableFilters = useMemo(
    () =>
      listingHasActiveFilters({
        ...listing,
        categorieSlug: selectedCategorieSlug,
      }),
    [listing, selectedCategorieSlug]
  );

  /** Catalogue local pour q/prix/catégorie/stock — commune_id n'existe que côté API */
  const aFiltresLocaux = hasShareableFilters && listing.communeId == null;

  // Grille : produits paginés via API uniquement sans filtres locaux (sinon pagination client sur catalogueComplet)
  useEffect(() => {
    const loadProduits = async () => {
      if (!boutique?.id) return;

      if (aFiltresLocaux) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { tri_par, ordre } = mapSortToApi(sortBy);
        const response = await getProduitsParBoutique(boutique.id, {
          page: currentPage,
          limite: pageSize,
          tri_par,
          ordre,
          q: listing.q || undefined,
          prix_min: listing.prixMin ?? undefined,
          prix_max: listing.prixMax ?? undefined,
          commune_id: listing.communeId ?? undefined,
          categorie_id: selectedCategorieId,
          featured: filterType === 'featured' || undefined,
          nouveaux: filterType === 'nouveau' || undefined,
          promotion: filterType === 'promo' || undefined,
          en_stock:
            filterStock === 'in-stock'
              ? true
              : filterStock === 'out-stock'
                ? false
                : undefined,
        });

        setProduits(response.donnees || []);
        setTotalProducts(response.total);
        setTotalPages(Math.max(1, response.total_pages));
      } catch (err: unknown) {
        console.error('Erreur lors du chargement des produits:', err);
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadProduits();
  }, [
    boutique?.id,
    currentPage,
    pageSize,
    sortBy,
    aFiltresLocaux,
    listing.q,
    listing.prixMin,
    listing.prixMax,
    listing.communeId,
    selectedCategorieId,
    filterType,
    filterStock,
  ]);

  const produitMatcheFiltres = useCallback(
    (produit: ProduitDB) => {
      if (selectedCategorieSlug && produit.categorie?.slug !== selectedCategorieSlug) {
        return false;
      }

      if (listing.q) {
        const searchLower = listing.q.toLowerCase();
        const matchNom = produit.nom.toLowerCase().includes(searchLower);
        const matchDescription = produit.description?.toLowerCase().includes(searchLower);
        if (!matchNom && !matchDescription) return false;
      }

      if (listing.prixMin != null && produit.prix < listing.prixMin) return false;
      if (listing.prixMax != null && produit.prix > listing.prixMax) return false;

      if (filterStock === 'in-stock' && !produit.en_stock) return false;
      if (filterStock === 'out-stock' && produit.en_stock) return false;

      if (filterType === 'nouveau' && !produit.est_nouveau) return false;
      if (filterType === 'promo' && !produit.est_en_promotion) return false;
      if (filterType === 'featured' && !produit.est_featured) return false;

      return true;
    },
    [selectedCategorieSlug, listing.q, listing.prixMin, listing.prixMax, filterStock, filterType]
  );

  const listeFiltreeTriee = useMemo(() => {
    if (!aFiltresLocaux) {
      return [];
    }
    return trierProduitsClient(
      catalogueComplet.filter(produitMatcheFiltres),
      sortBy
    );
  }, [aFiltresLocaux, catalogueComplet, produitMatcheFiltres, sortBy]);

  const produitsAffiche = useMemo(() => {
    if (aFiltresLocaux) {
      const start = (currentPage - 1) * pageSize;
      return listeFiltreeTriee.slice(start, start + pageSize);
    }
    return produits;
  }, [aFiltresLocaux, listeFiltreeTriee, currentPage, pageSize, produits]);

  const totalPourPagination = useMemo(
    () => (aFiltresLocaux ? listeFiltreeTriee.length : totalProducts),
    [aFiltresLocaux, listeFiltreeTriee.length, totalProducts]
  );

  const pagesPourPagination = useMemo(() => {
    if (aFiltresLocaux) {
      const n = totalPourPagination;
      if (n <= 0) {
        return 1;
      }
      return Math.max(1, Math.ceil(n / pageSize));
    }
    return totalPages;
  }, [aFiltresLocaux, totalPourPagination, pageSize, totalPages]);

  useEffect(() => {
    if (aFiltresLocaux) {
      if (listeFiltreeTriee.length === 0) {
        if (currentPage > 1) {
          setPageInUrl(1);
        }
        return;
      }
      if (currentPage > pagesPourPagination) {
        setPageInUrl(pagesPourPagination);
      }
      return;
    }
    if (totalPages <= 0) {
      return;
    }
    if (currentPage > totalPages) {
      setPageInUrl(totalPages);
    }
  }, [
    aFiltresLocaux,
    listeFiltreeTriee.length,
    pagesPourPagination,
    currentPage,
    totalPages,
    setPageInUrl,
  ]);

  const handleCategorieChange = useCallback(
    (slug: string | null) => {
      const categorieId = slug
        ? categories.find((c) => c.slug === slug)?.id ?? null
        : null;
      replaceListing({
        categorieSlug: slug,
        categorieId,
        page: 1,
      });
    },
    [replaceListing, categories]
  );

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

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    handleResetPageInUrl();
  };

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

  const handleVoirPlus = () => {
    handlePageSizeChange(pageSize + TAILLE_LOT);
  };

  const handleAddToCart = async (produit: ProduitDB) => {
    if (!boutique?.id) return;

    if (produitHasRequiredVariants(produit.variants)) {
      router.push(`/${boutiqueName}/produit/${produit.id}`);
      return;
    }

    try {
      setAddingId(produit.id);
      const ok = await ajouterProduit(boutique.id, produit.id, 1, {});
      if (ok) {
        success(`${produit.nom} ajouté au panier`, 'Succès', 3000);
      } else {
        showError("Impossible d'ajouter au panier", 'Erreur', 4000);
      }
    } catch {
      showError("Impossible d'ajouter au panier", 'Erreur', 4000);
    } finally {
      setAddingId(null);
    }
  };

  const subtitleParts = useMemo(() => {
    const n = aFiltresLocaux ? totalPourPagination : totalProducts;
    return `${n} produit${n > 1 ? 's' : ''}`;
  }, [aFiltresLocaux, totalPourPagination, totalProducts]);

  const categoryChipItems = useMemo(
    () => [
      { id: 'all', label: 'Tout', count: catalogueComplet.length },
      ...categories.map((categorie) => ({
        id: categorie.slug,
        label: categorie.nom,
        count: categorie.count,
      })),
    ],
    [categories, catalogueComplet.length]
  );

  const activeCategoryId = selectedCategorieSlug || 'all';

  const handleCategoryChipSelect = useCallback(
    (id: string) => {
      handleCategorieChange(id === 'all' ? null : id);
    },
    [handleCategorieChange]
  );

  const activeFilterChips = useMemo(() => {
    const chips: FiltreActif[] = [];

    if (selectedCategorieSlug) {
      const categorie = categories.find((c) => c.slug === selectedCategorieSlug);
      chips.push({
        id: 'categorie',
        label: categorie?.nom ?? selectedCategorieSlug,
        onRemove: () => handleCategorieChange(null),
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

    if (filterStock !== 'all') {
      chips.push({
        id: 'stock',
        label: labelForFilterStock(filterStock),
        onRemove: () => handleFilterStockChange('all'),
      });
    }

    if (filterType !== 'all') {
      chips.push({
        id: 'type',
        label: labelForFilterType(filterType),
        onRemove: () => handleFilterTypeChange('all'),
      });
    }

    return chips;
  }, [
    selectedCategorieSlug,
    categories,
    listing.q,
    listing.prixMin,
    listing.prixMax,
    listing.communeId,
    communes,
    filterStock,
    filterType,
    handleCategorieChange,
    replaceListing,
  ]);

  const mobileFilterCount =
    (filterStock !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (sortBy !== 'recent' ? 1 : 0) +
    (listing.prixMin != null || listing.prixMax != null ? 1 : 0) +
    (listing.communeId != null ? 1 : 0);

  const resteAVoir = Math.max(0, totalPourPagination - produitsAffiche.length);
  const prochainLot = Math.min(TAILLE_LOT, resteAVoir);

  if (boutiqueLoading || (aFiltresLocaux ? categoriesLoading : loading)) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-end justify-between gap-4 pt-5 pb-4 sm:pt-7">
            <div>
              <Skeleton className="mb-2 h-7 w-52 sm:h-8" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="hidden h-3.5 w-32 sm:block" />
          </div>
          <div className="hidden items-center gap-4 border-b border-[#ececea] pb-4 sm:flex">
            <Skeleton className="h-10 w-full max-w-[300px] rounded-[9px]" />
            <CategoryChipsSkeleton count={4} />
          </div>
          <div className="py-6">
            <ProductCardGridSkeleton count={8} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (boutiqueError || (!aFiltresLocaux && error) || !boutique) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <ErrorState
          title="Impossible de charger les produits"
          message={boutiqueError || error || 'Une erreur est survenue'}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout boutiqueName={boutiqueName}>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex items-end justify-between gap-4 pt-5 pb-4 sm:pt-7">
          <div>
            <h1 className="text-xl font-semibold text-[#17181a] sm:text-2xl">
              Tous les articles
            </h1>
            <p className="mt-1 text-[13px] text-[#5f6369] sm:text-sm">{subtitleParts}</p>
          </div>
          <nav aria-label="Fil d'Ariane" className="hidden shrink-0 text-[13px] text-[#9a9892] sm:block">
            <Link href={`/${boutiqueName}`} className="transition-colors hover:text-[#17181a]">
              Accueil
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#5f6369]">Articles</span>
          </nav>
        </div>

        {/* Barre de filtres — desktop */}
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
            activeId={activeCategoryId}
            onSelect={handleCategoryChipSelect}
            className="flex-1"
          />

          <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#5f6369]">
            <span>Trier :</span>
            <select
              value={sortBy}
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

        {/* Barre de filtres — mobile */}
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

            <button
              type="button"
              onClick={() => setFiltresOuverts(true)}
              aria-label="Ouvrir les filtres"
              className="relative flex h-10 shrink-0 items-center gap-1.5 rounded-[9px] border border-[#e0ded9] bg-white px-3 text-[13px] font-medium text-[#17181a]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {mobileFilterCount > 0 && (
                <span
                  className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] text-white"
                  style={{ backgroundColor: 'var(--color-shop-primary, var(--primary-color))' }}
                >
                  {mobileFilterCount}
                </span>
              )}
            </button>
          </div>

          <CategoryChips
            items={categoryChipItems}
            activeId={activeCategoryId}
            onSelect={handleCategoryChipSelect}
          />
        </div>

        {/* Filtres actifs */}
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

        {/* Grille produits */}
        <div className="pb-10 pt-2 sm:pb-14">
          {produitsAffiche.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[15px] text-[#5f6369]">Aucun produit trouvé</p>
              {aFiltresLocaux && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-[13.5px] font-medium underline underline-offset-2"
                  style={{ color: 'var(--color-shop-primary, var(--primary-color))' }}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {produitsAffiche.map((produit) => (
                  <StorefrontCard
                    key={produit.id}
                    boutiqueSlug={boutiqueName}
                    compactCta
                    produit={produit}
                    onAddToCart={() => handleAddToCart(produit)}
                    adding={adding && addingId === produit.id}
                  />
                ))}
              </div>

              {resteAVoir > 0 && (
                <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
                  <p className="text-[13px] text-[#8b8f95]">
                    {produitsAffiche.length} article{produitsAffiche.length > 1 ? 's' : ''} sur{' '}
                    {totalPourPagination}
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
      </div>

      {/* Panneau de filtres — mobile (bottom sheet) */}
      {filtresOuverts && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-[rgba(23,24,26,.42)]"
            onClick={() => setFiltresOuverts(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white p-5 pb-8">
            <div className="mx-auto mb-5 h-1 w-[38px] rounded-full bg-[#e0ded9]" />
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
                {STOCK_OPTIONS.map((opt) => {
                  const active = filterStock === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFilterStockChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, var(--primary-color))' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const active = filterType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFilterTypeChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, var(--primary-color))' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[.07em] text-[#8b8f95]">
                Trier par
              </h3>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const active = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSortChange(opt.value)}
                      className="rounded-full px-3.5 py-1.5 text-[13px] font-medium"
                      style={
                        active
                          ? { ...filtreChipStyle, border: '1.5px solid var(--color-shop-primary, var(--primary-color))' }
                          : { border: '1px solid #e6e4df', color: '#3c4045' }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ShopCtaButton onClick={() => setFiltresOuverts(false)}>
              Voir les {totalPourPagination} article{totalPourPagination > 1 ? 's' : ''}
            </ShopCtaButton>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
