'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBoutique } from '@/hooks/useBoutique';
import { useProduitsParCategorie } from '@/hooks/useProduits';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from './ui/Toast';
import { CategoryChips } from './storefront/CategoryChips';
import { StorefrontCard } from './storefront/StorefrontCard';
import { CategoryChipsSkeleton, ProductCardGridSkeleton, Skeleton } from './ui/Skeleton';
import { ErrorState } from './LoadingStates';
import { produitHasRequiredVariants } from '@/lib/utils/shop-theme';
import type { ProduitDB } from '@/lib/database-types';

interface TrendingByCategoryProps {
  boutiqueName: string;
}

export default function TrendingByCategory({
  boutiqueName,
}: TrendingByCategoryProps) {
  const router = useRouter();
  const { boutique, loading: boutiqueLoading, error: boutiqueError } =
    useBoutique(boutiqueName);
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch,
  } = useProduitsParCategorie(boutique?.id || 0);
  const { ajouterProduit, loading: adding } = useAjoutPanier();
  const { success, error: showError, toasts, removeToast } = useToast();
  const [activeChip, setActiveChip] = useState('all');
  const [addingId, setAddingId] = useState<number | null>(null);

  const chipItems = useMemo(() => {
    if (!categories) return [];
    const entries = Object.entries(categories);
    const total = entries.reduce(
      (sum, [, data]) => sum + data.produits.length,
      0
    );
    const promoCount = entries.reduce(
      (sum, [, data]) =>
        sum + data.produits.filter((p) => p.est_en_promotion).length,
      0
    );
    const chips = [
      { id: 'all', label: 'Tout', count: total },
      ...entries.map(([slug, data]) => ({
        id: slug,
        label: data.categorie.nom,
        count: data.produits.length,
      })),
    ];
    if (promoCount > 0) {
      chips.push({ id: 'promos', label: 'Promos', count: promoCount });
    }
    return chips;
  }, [categories]);

  const visibleSections = useMemo(() => {
    if (!categories) return [];
    const entries = Object.entries(categories);
    if (activeChip === 'all') return entries;
    if (activeChip === 'promos') {
      return entries
        .map(([slug, data]) => [
          slug,
          {
            ...data,
            produits: data.produits.filter((p) => p.est_en_promotion),
          },
        ] as const)
        .filter(([, data]) => data.produits.length > 0);
    }
    return entries.filter(([slug]) => slug === activeChip);
  }, [categories, activeChip]);

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

  if (boutiqueLoading || categoriesLoading) {
    return (
      <section>
        <div className="sticky top-[54px] z-20 border-b border-[#ececea] bg-[#fdfdfc] sm:top-[60px]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:h-[52px] sm:px-8">
            <CategoryChipsSkeleton count={5} />
            <Skeleton className="hidden h-3.5 w-28 shrink-0 sm:block" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:space-y-[34px] sm:px-8 sm:py-[30px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-5 w-36 sm:h-6" />
              <Skeleton className="h-3.5 w-16" />
              <span className="flex-1" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <ProductCardGridSkeleton count={8} />
          </div>
        </div>
      </section>
    );
  }

  if (boutiqueError || categoriesError || !boutique || !categories) {
    return (
      <ErrorState
        title="Impossible de charger les produits"
        message={boutiqueError || categoriesError || 'Aucun produit trouvé'}
        onRetry={refetch}
      />
    );
  }

  if (Object.keys(categories).length === 0) {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-8">
          <h2 className="text-lg font-semibold text-[#17181a]">
            Aucun produit pour le moment
          </h2>
          <p className="mt-2 text-sm text-[#5f6369]">
            Revenez bientôt pour découvrir les nouveautés.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="sticky top-[54px] z-20 border-b border-[#ececea] bg-[#fdfdfc] sm:top-[60px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:h-[52px] sm:px-8">
          <CategoryChips
            items={chipItems}
            activeId={activeChip}
            onSelect={setActiveChip}
            className="flex-1"
          />
          <div className="hidden shrink-0 text-[13px] text-[#5f6369] sm:block">
            Trier : Plus récents
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:space-y-[34px] sm:px-8 sm:py-[30px]">
        {visibleSections.map(([slug, categorieData]) => (
          <div key={slug} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-semibold text-[#17181a] sm:text-lg">
                {categorieData.categorie.nom}
              </h2>
              <span className="text-[13px] text-[#9a9892]">
                {categorieData.produits.length} article
                {categorieData.produits.length > 1 ? 's' : ''}
              </span>
              <span className="flex-1" />
              <Link
                href={`/${boutiqueName}/produits?categorie=${categorieData.categorie.slug}`}
                className="text-[13px] font-medium focus:outline-none focus-visible:underline"
                style={{
                  color: 'var(--color-shop-primary, var(--primary-color))',
                }}
              >
                Tout voir
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {categorieData.produits.slice(0, 4).map((produit) => (
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
          </div>
        ))}
      </div>
    </section>
  );
}
