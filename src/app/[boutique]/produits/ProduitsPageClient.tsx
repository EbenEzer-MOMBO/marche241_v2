'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useBoutique } from '@/hooks/useBoutique';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { getProduitsParBoutique } from '@/lib/services/products';
import { getCommunesActives } from '@/lib/services/communes';
import { ProduitDB } from '@/lib/database-types';
import type { Categorie } from '@/lib/database-types';
import { ProductCardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { StorefrontCard } from '@/components/storefront/StorefrontCard';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { ProductListingFilters } from '@/components/catalog/ProductListingFilters';
import { produitHasRequiredVariants } from '@/lib/utils/shop-theme';
import { useProductListingUrl } from '@/hooks/useProductListingUrl';
import { toApiProduitsQuery, type ProductSearchState } from '@/lib/product-search';

type CategorieAvecCompte = {
  id: number;
  nom: string;
  slug: string;
  count: number;
};

const CHUNK_FETCH_META = 100;
const MAX_PAGES_META = 500;
const TAILLE_LOT = 12;

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

const produitMatcheFiltresLocaux = (
  produit: ProduitDB,
  filters: ProductSearchState,
  categorieId: number | null
): boolean => {
  if (filters.categorieSlug && produit.categorie?.slug !== filters.categorieSlug) {
    return false;
  }
  if (categorieId != null && produit.categorie_id !== categorieId) {
    return false;
  }
  if (filters.q.trim()) {
    const searchLower = filters.q.toLowerCase();
    const matchNom = produit.nom.toLowerCase().includes(searchLower);
    const matchDescription = produit.description?.toLowerCase().includes(searchLower);
    if (!matchNom && !matchDescription) return false;
  }
  if (filters.prixMin != null && produit.prix < filters.prixMin) return false;
  if (filters.prixMax != null && produit.prix > filters.prixMax) return false;
  if (filters.stock === 'in-stock' && !produit.en_stock) return false;
  if (filters.stock === 'out-stock' && produit.en_stock) return false;
  if (filters.type === 'nouveau' && !produit.est_nouveau) return false;
  if (filters.type === 'promo' && !produit.est_en_promotion) return false;
  if (filters.type === 'featured' && !produit.est_featured) return false;
  return true;
};

const dateProduitVersNombre = (p: ProduitDB): number => {
  const d = p.date_creation;
  if (d instanceof Date) return d.getTime();
  if (typeof d === 'string') return new Date(d).getTime();
  return 0;
};

const trierProduitsClient = (list: ProduitDB[], sort: ProductSearchState['sort']): ProduitDB[] => {
  const copie = [...list];
  switch (sort) {
    case 'recent':
      copie.sort((a, b) => dateProduitVersNombre(b) - dateProduitVersNombre(a) || b.id - a.id);
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

export default function ProduitsPageClient() {
  const params = useParams();
  const router = useRouter();
  const boutiqueName = params.boutique as string;
  const { filters, replaceFilters } = useProductListingUrl();

  const { boutique, loading: boutiqueLoading, error: boutiqueError } = useBoutique(boutiqueName);
  const { ajouterProduit, loading: adding } = useAjoutPanier();
  const { success, error: showError, toasts, removeToast } = useToast();

  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [catalogueComplet, setCatalogueComplet] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<CategorieAvecCompte[]>([]);
  const [communes, setCommunes] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(24);
  const [totalProducts, setTotalProducts] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const resolvedCategorieId = useMemo(() => {
    if (filters.categorieId) return filters.categorieId;
    if (!filters.categorieSlug) return null;
    return categories.find((c) => c.slug === filters.categorieSlug)?.id ?? null;
  }, [filters.categorieId, filters.categorieSlug, categories]);

  useEffect(() => {
    if (!boutique?.id) return;

    let cancelled = false;

    const run = async () => {
      try {
        const [allProduits, communesBoutique] = await Promise.all([
          fetchAllProduitsPourCategories(boutique.id),
          getCommunesActives(boutique.id).catch(() => []),
        ]);
        if (cancelled) return;
        setCatalogueComplet(allProduits);
        setCategories(buildCategoriesFromProduits(allProduits));
        setCommunes(
          communesBoutique.map((commune) => ({
            id: commune.id,
            label: commune.nom_commune,
          }))
        );
      } catch (err) {
        console.error('Erreur lors du chargement des métadonnées catalogue:', err);
        if (!cancelled) {
          setCategories([]);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [boutique?.id]);

  useEffect(() => {
    if (!filters.categorieSlug || filters.categorieId || !resolvedCategorieId) {
      return;
    }
    replaceFilters({ categorieId: resolvedCategorieId });
  }, [filters.categorieSlug, filters.categorieId, resolvedCategorieId, replaceFilters]);

  useEffect(() => {
    if (!boutique?.id) return;

    let cancelled = false;

    const loadProduits = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = toApiProduitsQuery(filters, {
          pageSize,
          boutiqueId: boutique.id,
          categorieId: resolvedCategorieId,
        });

        const response = await getProduitsParBoutique(boutique.id, query);

        if (cancelled) return;
        setProduits(response.donnees || []);
        setTotalProducts(response.total);
      } catch (err: unknown) {
        console.error('Erreur lors du chargement des produits:', err);
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProduits();
    return () => {
      cancelled = true;
    };
  }, [boutique?.id, filters, pageSize, resolvedCategorieId]);

  const aFiltresLocaux = useMemo(
    () =>
      Boolean(filters.q.trim()) ||
      filters.prixMin != null ||
      filters.prixMax != null ||
      Boolean(filters.categorieSlug) ||
      filters.categorieId != null ||
      filters.stock !== 'all' ||
      filters.type !== 'all',
    [filters]
  );

  const listeFiltree = useMemo(() => {
    if (!aFiltresLocaux || catalogueComplet.length === 0) return [];
    return trierProduitsClient(
      catalogueComplet.filter((produit) =>
        produitMatcheFiltresLocaux(produit, filters, resolvedCategorieId)
      ),
      filters.sort
    );
  }, [aFiltresLocaux, catalogueComplet, filters, resolvedCategorieId]);

  const useLocalFilteredList =
    aFiltresLocaux && catalogueComplet.length > 0 && filters.communeId == null;

  const produitsAffiche = useLocalFilteredList
    ? listeFiltree.slice(0, pageSize)
    : produits;

  const totalAffiche = useLocalFilteredList ? listeFiltree.length : totalProducts;

  const handleClearAllFilters = useCallback(() => {
    replaceFilters({
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
  }, [replaceFilters]);

  const handleVoirPlus = () => {
    setPageSize((prev) => prev + TAILLE_LOT);
    replaceFilters({ page: 1 });
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

  const resteAVoir = Math.max(0, totalAffiche - produitsAffiche.length);
  const prochainLot = Math.min(TAILLE_LOT, resteAVoir);

  const isInitialLoading = boutiqueLoading || (loading && !boutique);
  const hasLocalCatalog = aFiltresLocaux && catalogueComplet.length > 0;
  const isFatalListingError = Boolean(error) && !hasLocalCatalog;

  if (isInitialLoading) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex items-end justify-between gap-4 pt-5 pb-4 sm:pt-7">
            <div>
              <Skeleton className="mb-2 h-7 w-52 sm:h-8" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="py-6">
            <ProductCardGridSkeleton count={8} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (boutiqueError || isFatalListingError || !boutique) {
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
            <p className="mt-1 text-[13px] text-[#5f6369] sm:text-sm">
              {totalAffiche} produit{totalAffiche > 1 ? 's' : ''}
            </p>
          </div>
          <nav aria-label="Fil d'Ariane" className="hidden shrink-0 text-[13px] text-[#9a9892] sm:block">
            <Link href={`/${boutiqueName}`} className="transition-colors hover:text-[#17181a]">
              Accueil
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#5f6369]">Articles</span>
          </nav>
        </div>

        <ProductListingFilters
          filters={filters}
          onPatch={replaceFilters}
          onClearAll={handleClearAllFilters}
          categories={categories}
          communes={communes}
          filtresOuverts={filtresOuverts}
          onOpenFiltres={() => setFiltresOuverts(true)}
          onCloseFiltres={() => setFiltresOuverts(false)}
          resultCount={totalAffiche}
        />

        <div className="pb-10 pt-2 sm:pb-14">
          {loading && !useLocalFilteredList ? (
            <div className="py-6">
              <ProductCardGridSkeleton count={8} />
            </div>
          ) : produitsAffiche.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[15px] text-[#5f6369]">Aucun produit trouvé</p>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[13.5px] font-medium underline underline-offset-2"
                style={{ color: 'var(--color-shop-primary, var(--primary-color))' }}
              >
                Réinitialiser les filtres
              </button>
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
                    {produitsAffiche.length} article{produitsAffiche.length > 1 ? 's' : ''} sur {totalAffiche}
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
    </MainLayout>
  );
}
