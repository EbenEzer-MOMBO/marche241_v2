'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProduitsParBoutique } from '@/lib/services/products';
import { StorefrontCard } from '@/components/storefront/StorefrontCard';
import { ProductCardGridSkeleton } from '@/components/ui/Skeleton';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { produitHasRequiredVariants } from '@/lib/utils/shop-theme';
import type { ProduitDB } from '@/lib/database-types';

interface RelatedProductsProps {
  boutiqueId: number;
  boutiqueSlug: string;
  currentProductId: number;
  limit?: number;
}

export function RelatedProducts({
  boutiqueId,
  boutiqueSlug,
  currentProductId,
  limit = 4,
}: RelatedProductsProps) {
  const router = useRouter();
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { ajouterProduit, loading: adding } = useAjoutPanier();
  const { success, error: showError, toasts, removeToast } = useToast();

  useEffect(() => {
    if (!boutiqueId) return;
    let cancelled = false;

    const loadProduits = async () => {
      try {
        setLoading(true);
        const response = await getProduitsParBoutique(boutiqueId, {
          page: 1,
          limite: limit + 1,
          tri_par: 'date_creation',
          ordre: 'DESC',
        });
        if (cancelled) return;
        const autres = (response.donnees || [])
          .filter((p) => p.id !== currentProductId)
          .slice(0, limit);
        setProduits(autres);
        setTotal(response.total);
      } catch (err) {
        if (!cancelled) {
          console.error('Erreur lors du chargement des articles liés:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProduits();

    return () => {
      cancelled = true;
    };
  }, [boutiqueId, currentProductId, limit]);

  const handleAddToCart = async (produit: ProduitDB) => {
    if (produitHasRequiredVariants(produit.variants)) {
      router.push(`/${boutiqueSlug}/produit/${produit.id}`);
      return;
    }

    try {
      setAddingId(produit.id);
      const ok = await ajouterProduit(boutiqueId, produit.id, 1, {});
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

  if (!loading && produits.length === 0) return null;

  return (
    <section className="border-t border-[#ececea] px-4 py-7 sm:px-8 sm:py-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="text-[17px] font-semibold text-[#17181a]">
            Autres articles de cette boutique
          </h2>
          {!loading && total > 0 && (
            <span className="text-[13px] text-[#9a9892]">
              {produits.length} sur {total}
            </span>
          )}
          <span className="flex-1" />
          <Link
            href={`/${boutiqueSlug}/produits`}
            className="text-[13px] font-medium focus:outline-none focus-visible:underline"
            style={{ color: 'var(--color-shop-primary, var(--primary-color))' }}
          >
            Tout voir
          </Link>
        </div>

        {loading ? (
          <ProductCardGridSkeleton count={limit} />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {produits.map((produit) => (
              <StorefrontCard
                key={produit.id}
                produit={produit}
                boutiqueSlug={boutiqueSlug}
                compactCta
                onAddToCart={() => void handleAddToCart(produit)}
                adding={adding && addingId === produit.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
