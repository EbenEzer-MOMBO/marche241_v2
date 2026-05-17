'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useBoutique } from '@/hooks/useBoutique';
import { formatPrix, getProduitImageUrl } from '@/lib/services/produits';
import { getProduitsParBoutique } from '@/lib/services/products';
import { ProduitDB } from '@/lib/database-types';
import type { Categorie } from '@/lib/database-types';
import SafeImage from '@/components/SafeImage';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { X, Search } from 'lucide-react';
import { ProduitsPagination } from '@/components/storefront/ProduitsPagination';

type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name';

/** Catégorie affichée dans le filtre, dérivée de l’ensemble des produits boutique (comptage exact) */
type CategorieAvecCompte = {
  id: number;
  nom: string;
  slug: string;
  count: number;
};

const CHUNK_FETCH_META = 100;
const MAX_PAGES_META = 500;

const mapSortToApi = (sort: SortKey): { tri_par: string; ordre: 'ASC' | 'DESC' } => {
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

export default function ProduitsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const boutiqueName = params.boutique as string;

  const rawPage = searchParams.get('page');
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  const selectedCategorieSlug = searchParams.get('categorie');

  const { boutique, loading: boutiqueLoading, error: boutiqueError } = useBoutique(boutiqueName);

  const [produits, setProduits] = useState<ProduitDB[]>([]);
  /** Catalogue complet boutique (agrégation API) : catégories + pagination filtrée côté client */
  const [catalogueComplet, setCatalogueComplet] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<CategorieAvecCompte[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'out-stock'>('all');
  const [filterType, setFilterType] = useState<'all' | 'nouveau' | 'promo' | 'featured'>('all');
  const [pageSize, setPageSize] = useState(24);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const replaceSearchParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

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

  const aFiltresLocaux = useMemo(
    () =>
      !!selectedCategorieSlug ||
      searchTerm.trim().length > 0 ||
      filterStock !== 'all' ||
      filterType !== 'all',
    [selectedCategorieSlug, searchTerm, filterStock, filterType]
  );

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
  }, [boutique?.id, currentPage, pageSize, sortBy, aFiltresLocaux]);

  const produitMatcheFiltres = useCallback(
    (produit: ProduitDB) => {
      if (selectedCategorieSlug && produit.categorie?.slug !== selectedCategorieSlug) {
        return false;
      }

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchNom = produit.nom.toLowerCase().includes(searchLower);
        const matchDescription = produit.description?.toLowerCase().includes(searchLower);
        if (!matchNom && !matchDescription) return false;
      }

      if (filterStock === 'in-stock' && !produit.en_stock) return false;
      if (filterStock === 'out-stock' && produit.en_stock) return false;

      if (filterType === 'nouveau' && !produit.est_nouveau) return false;
      if (filterType === 'promo' && !produit.est_en_promotion) return false;
      if (filterType === 'featured' && !produit.est_featured) return false;

      return true;
    },
    [selectedCategorieSlug, searchTerm, filterStock, filterType]
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

  const handleCategorieChange = (slug: string | null) => {
    replaceSearchParams((p) => {
      if (slug) {
        p.set('categorie', slug);
      } else {
        p.delete('categorie');
      }
      p.delete('page');
    });
  };

  const handleSortChange = (value: SortKey) => {
    setSortBy(value);
    handleResetPageInUrl();
  };

  const handleFilterStockChange = (value: 'all' | 'in-stock' | 'out-stock') => {
    setFilterStock(value);
    handleResetPageInUrl();
  };

  const handleFilterTypeChange = (value: 'all' | 'nouveau' | 'promo' | 'featured') => {
    setFilterType(value);
    handleResetPageInUrl();
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    handleResetPageInUrl();
  };

  const subtitleParts = useMemo(() => {
    const n = aFiltresLocaux ? totalPourPagination : totalProducts;
    return `${n} produit${n > 1 ? 's' : ''}`;
  }, [aFiltresLocaux, totalPourPagination, totalProducts]);

  if (boutiqueLoading || (aFiltresLocaux ? categoriesLoading : loading)) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />

          <div className="flex gap-8">
            <div className="hidden lg:block w-64 flex-shrink-0">
              <Skeleton className="h-48 w-full" />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                    <SkeletonText lines={2} />
                    <Skeleton className="h-4 w-20 mt-2" />
                  </div>
                ))}
              </div>
            </div>
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
      <div className="bg-gray-50 min-h-screen pt-20 pb-8 sm:pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Tous les Produits
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">{subtitleParts}</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Rechercher un produit"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Catégories
                  </label>
                  <select
                    value={selectedCategorieSlug || ''}
                    onChange={(e) => handleCategorieChange(e.target.value || null)}
                    aria-label="Filtrer par catégorie"
                    aria-busy={categoriesLoading}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">
                      Toutes {totalProducts > 0 ? `(${totalProducts})` : ''}
                      {categoriesLoading ? ' — …' : ''}
                    </option>
                    {categories.map((categorie) => (
                      <option key={categorie.id} value={categorie.slug}>
                        {categorie.nom} ({categorie.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                  <select
                    value={filterStock}
                    onChange={(e) =>
                      handleFilterStockChange(e.target.value as 'all' | 'in-stock' | 'out-stock')
                    }
                    aria-label="Filtrer par disponibilité"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="in-stock">En stock</option>
                    <option value="out-stock">Épuisés</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      handleFilterTypeChange(
                        e.target.value as 'all' | 'nouveau' | 'promo' | 'featured'
                      )
                    }
                    aria-label="Filtrer par type de produit"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="nouveau">Nouveautés</option>
                    <option value="promo">Promos</option>
                    <option value="featured">Vedettes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortKey)}
                    aria-label="Trier les produits"
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="recent">Récents</option>
                    <option value="price-asc">Prix ↑</option>
                    <option value="price-desc">Prix ↓</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-4 shadow-sm sticky top-32">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Catégories</h3>
                  <select
                    value={selectedCategorieSlug || ''}
                    onChange={(e) => handleCategorieChange(e.target.value || null)}
                    aria-label="Filtrer par catégorie"
                    aria-busy={categoriesLoading}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">
                      Toutes {totalProducts > 0 ? `(${totalProducts})` : ''}
                      {categoriesLoading ? ' — …' : ''}
                    </option>
                    {categories.map((categorie) => (
                      <option key={categorie.id} value={categorie.slug}>
                        {categorie.nom} ({categorie.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Disponibilité</h3>
                  <select
                    value={filterStock}
                    onChange={(e) =>
                      handleFilterStockChange(e.target.value as 'all' | 'in-stock' | 'out-stock')
                    }
                    aria-label="Filtrer par disponibilité"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="in-stock">En stock</option>
                    <option value="out-stock">Épuisés</option>
                  </select>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Type</h3>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      handleFilterTypeChange(
                        e.target.value as 'all' | 'nouveau' | 'promo' | 'featured'
                      )
                    }
                    aria-label="Filtrer par type de produit"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="nouveau">Nouveautés</option>
                    <option value="promo">En promotion</option>
                    <option value="featured">Produits vedettes</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Trier par</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortKey)}
                    aria-label="Trier les produits"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              {produitsAffiche.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
                  {selectedCategorieSlug && (
                    <button
                      type="button"
                      onClick={() => handleCategorieChange(null)}
                      className="mt-4 text-primary hover:underline"
                    >
                      Voir tous les produits
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {produitsAffiche.map((produit) => (
                    <Link
                      key={produit.id}
                      href={`/${boutiqueName}/produit/${produit.id}`}
                      className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="relative mb-3">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <SafeImage
                            src={getProduitImageUrl(produit.image_principale)}
                            alt={produit.nom}
                            width={200}
                            height={200}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              !produit.en_stock ? 'grayscale opacity-50' : ''
                            }`}
                          />

                          {!produit.en_stock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                                  Épuisé
                                </div>
                                <p className="text-white text-xs">Stock indisponible</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {produit.en_stock && (
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {produit.est_nouveau && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Nouveau
                              </span>
                            )}
                            {produit.est_en_promotion && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Promo
                              </span>
                            )}
                            {produit.est_featured && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Vedette
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-black font-medium text-sm mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-200">
                          {produit.nom}
                        </h4>

                        <div className="flex flex-col gap-1">
                          <span className="text-black font-semibold text-sm">
                            {formatPrix(produit.prix)}
                          </span>
                          {produit.prix_original && produit.prix_original !== produit.prix && (
                            <span className="text-gray-medium line-through text-xs">
                              {formatPrix(produit.prix_original)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <ProduitsPagination
                currentPage={currentPage}
                totalPages={pagesPourPagination}
                totalProducts={totalPourPagination}
                pageSize={pageSize}
                onPageChange={setPageInUrl}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
