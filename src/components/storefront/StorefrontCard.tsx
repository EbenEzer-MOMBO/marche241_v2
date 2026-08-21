'use client';

import { CardProduit, type CardProduitData } from '@/components/storefront/CardProduit';
import { CardEvenement } from '@/components/storefront/CardEvenement';
import { CardService } from '@/components/storefront/CardService';
import {
  getProductSalesKind,
  toCardEvenementData,
  toCardServiceData,
} from '@/lib/utils/product-sales-kind';
import type { ProduitDB } from '@/lib/database-types';

interface StorefrontCardProps {
  produit: ProduitDB;
  boutiqueSlug: string;
  onAddToCart?: () => void;
  adding?: boolean;
  compactCta?: boolean;
}

/**
 * Choisit la carte catalogue adaptée au format de vente du produit.
 */
export const StorefrontCard = ({
  produit,
  boutiqueSlug,
  onAddToCart,
  adding = false,
  compactCta = false,
}: StorefrontCardProps) => {
  const kind = getProductSalesKind(produit);

  if (kind === 'evenement') {
    return (
      <CardEvenement
        evenement={toCardEvenementData(produit)}
        boutiqueSlug={boutiqueSlug}
        onReserve={onAddToCart}
      />
    );
  }

  if (kind === 'service') {
    return (
      <CardService
        service={toCardServiceData(produit)}
        boutiqueSlug={boutiqueSlug}
        onBook={onAddToCart}
      />
    );
  }

  const cardProduit: CardProduitData = {
    id: produit.id,
    nom: produit.nom,
    prix: produit.prix,
    prix_original: produit.prix_original || produit.prix_promo,
    image_principale: produit.image_principale,
    en_stock: produit.en_stock,
    quantite_stock: produit.quantite_stock ?? produit.stock ?? undefined,
    est_en_promotion: produit.est_en_promotion,
    est_nouveau: produit.est_nouveau,
  };

  return (
    <CardProduit
      boutiqueSlug={boutiqueSlug}
      compactCta={compactCta}
      produit={cardProduit}
      onAddToCart={onAddToCart}
      adding={adding}
    />
  );
};
