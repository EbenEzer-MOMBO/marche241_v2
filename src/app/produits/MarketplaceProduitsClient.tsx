'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { ProductListingFilters } from '@/components/catalog/ProductListingFilters';
import { StorefrontCard } from '@/components/storefront/StorefrontCard';
import { ProductCardGridSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { useProductListingUrl } from '@/hooks/useProductListingUrl';
import { toApiProduitsQuery } from '@/lib/product-search';
import { getProduitsMarketplace } from '@/lib/services/products';
import { getCategoriesMarketplace } from '@/lib/services/categories';
import { getCommunesMarketplace } from '@/lib/services/communes';
import type { ProduitDB } from '@/lib/database-types';

const TAILLE_LOT = 12;

export default function MarketplaceProduitsClient() {
  const { filters, replaceFilters } = useProductListingUrl();
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<
    { id: number; slug: string; nom: string; count?: number }[]
  >([]);
  const [communes, setCommunes] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(24);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      const [cats, communesData] = await Promise.all([
        getCategoriesMarketplace(),
        getCommunesMarketplace(),
      ]);
      if (cancelled) return;
      setCategories(
        cats.map((categorie) => ({
          id: categorie.id,
          slug: categorie.slug,
          nom: categorie.nom,
          count: categorie.nombre_produits,
        }))
      );
      setCommunes(
        communesData.map((commune) => ({
          id: commune.id,
          label: commune.nom_commune,
        }))
      );
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedCategorieId = useMemo(() => {
    if (filters.categorieId) return filters.categorieId;
    if (!filters.categorieSlug) return null;
    return categories.find((c) => c.slug === filters.categorieSlug)?.id ?? null;
  }, [filters.categorieId, filters.categorieSlug, categories]);

  useEffect(() => {
    let cancelled = false;

    const loadProduits = async () => {
      try {
        setLoading(true);
        setError(null);
        const query = toApiProduitsQuery(filters, {
          pageSize,
          categorieId: resolvedCategorieId,
        });
        const response = await getProduitsMarketplace(query);
        if (cancelled) return;
        setProduits(response.donnees || []);
        setTotalProducts(response.total);
      } catch (err: unknown) {
        console.error('Erreur marketplace produits:', err);
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
  }, [filters, pageSize, resolvedCategorieId]);

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

  const resteAVoir = Math.max(0, totalProducts - produits.length);
  const prochainLot = Math.min(TAILLE_LOT, resteAVoir);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader activePage="produits" />
      <main className="pt-[68px]">
        <section className="border-b border-gray-200 bg-gray-50 px-4 py-6 lg:px-10">
          <div className="mx-auto max-w-[1360px]">
            <h1 className="text-[26px] font-bold tracking-tight text-gray-900 lg:text-[30px]">
              Tous les produits
            </h1>
            <p className="mt-1 text-[15px] text-gray-600">
              Recherchez parmi les boutiques Marché 241 · {totalProducts} résultat
              {totalProducts > 1 ? 's' : ''}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-6 lg:px-10">
          <ProductListingFilters
            variant="market"
            filters={filters}
            onPatch={replaceFilters}
            onClearAll={handleClearAllFilters}
            categories={categories}
            communes={communes}
            filtresOuverts={filtresOuverts}
            onOpenFiltres={() => setFiltresOuverts(true)}
            onCloseFiltres={() => setFiltresOuverts(false)}
            resultCount={totalProducts}
          />

          {loading ? (
            <div className="py-8">
              <ProductCardGridSkeleton count={8} />
            </div>
          ) : error ? (
            <ErrorState
              title="Impossible de charger le catalogue"
              message={error}
              onRetry={() => window.location.reload()}
            />
          ) : produits.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-[15px] text-[#5f6369]">Aucun produit trouvé</p>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[13.5px] font-medium text-[#508e27] underline underline-offset-2"
              >
                Réinitialiser les filtres
              </button>
              <Link href="/affiche_boutiques" className="text-sm text-gray-500 underline">
                Voir les boutiques
              </Link>
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
                <div className="mt-8 flex flex-col items-center gap-3">
                  <p className="text-[13px] text-[#8b8f95]">
                    {produits.length} article{produits.length > 1 ? 's' : ''} sur {totalProducts}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPageSize((prev) => prev + TAILLE_LOT)}
                    className="rounded-[11px] border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Voir les {prochainLot} suivant{prochainLot > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
