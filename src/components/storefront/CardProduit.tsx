'use client';

import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { Etoiles } from '@/components/avis/Etoiles';
import { formatPrix, getProduitImageUrl } from '@/lib/services/produits';
import {
  formatLowStockLabel,
  formatPromoBadge,
} from '@/lib/utils/shop-theme';

export interface CardProduitData {
  id: number;
  nom: string;
  prix: number;
  prix_original?: number | null;
  image_principale?: string | null;
  en_stock: boolean;
  quantite_stock?: number;
  est_en_promotion?: boolean;
  est_nouveau?: boolean;
  badge?: string | null;
  /** Note moyenne des avis vérifiés, affichée seulement au-delà du seuil (`afficher_note`). */
  note_moyenne?: number | null;
  nombre_avis?: number | null;
  afficher_note?: boolean;
}

interface CardProduitProps {
  produit: CardProduitData;
  boutiqueSlug: string;
  ctaLabel?: string;
  showBuyNow?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  adding?: boolean;
  compactCta?: boolean;
}

export const CardProduit = ({
  produit,
  boutiqueSlug,
  ctaLabel = 'Ajouter au panier',
  showBuyNow = false,
  onAddToCart,
  onBuyNow,
  adding = false,
  compactCta = false,
}: CardProduitProps) => {
  const href = `/${boutiqueSlug}/produit/${produit.id}`;
  const badge =
    produit.badge ||
    formatPromoBadge(produit.prix, produit.prix_original) ||
    (produit.est_nouveau ? 'Nouveau' : null);
  const lowStock = formatLowStockLabel(
    produit.en_stock,
    produit.quantite_stock
  );
  const mobileCta = compactCta ? 'Ajouter' : ctaLabel;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!produit.en_stock || adding) return;
    onAddToCart?.();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!produit.en_stock || adding) return;
    onBuyNow?.();
  };

  return (
    <article className="flex flex-col gap-2.5">
      <Link
        href={href}
        className="group relative block aspect-square overflow-hidden rounded-[10px] bg-[#f4f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/40"
        aria-label={produit.nom}
      >
        <SafeImage
          src={getProduitImageUrl(produit.image_principale)}
          alt={produit.nom}
          width={400}
          height={400}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
            !produit.en_stock ? 'grayscale opacity-50' : ''
          }`}
        />
        {!produit.en_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="rounded-md bg-[#b3261e] px-2.5 py-1 text-xs font-medium text-white">
              Épuisé
            </span>
          </div>
        )}
        {produit.afficher_note && produit.note_moyenne ? (
          <span
            className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-1 text-[11.5px] text-[#5f6369] shadow-sm"
            aria-label={`Note ${Number(produit.note_moyenne).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} sur 5, ${produit.nombre_avis} avis`}
          >
            <Etoiles note={Number(produit.note_moyenne)} taille={11} />
            <span className="font-medium text-[#17181a]">
              {Number(produit.note_moyenne).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span>({produit.nombre_avis})</span>
          </span>
        ) : null}
        {produit.en_stock && badge && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-[#17181a] px-2 py-1 font-mono text-[11px] font-medium text-white">
            {badge}
          </span>
        )}
      </Link>

      <Link
        href={href}
        className="min-h-[38px] text-[14px] leading-[1.4] text-[#17181a] line-clamp-2 hover:opacity-70 focus:outline-none focus-visible:underline"
      >
        {produit.nom}
      </Link>


      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-semibold text-[#17181a]">
          {formatPrix(produit.prix)}
        </span>
        {produit.prix_original &&
          produit.prix_original > produit.prix && (
            <span className="text-[13px] text-[#9a9892] line-through">
              {formatPrix(produit.prix_original)}
            </span>
          )}
      </div>

      {lowStock && (
        <div className="-mt-1 font-mono text-xs font-medium text-[#d97706]">
          {lowStock}
        </div>
      )}

      <ShopCtaButton
        size="card"
        disabled={!produit.en_stock || adding}
        onClick={handleAdd}
        aria-label={`${ctaLabel} — ${produit.nom}`}
        className="mt-0.5"
      >
        <span className="sm:hidden">{mobileCta === ctaLabel ? 'Ajouter' : mobileCta}</span>
        <span className="hidden sm:inline">
          {adding ? 'Ajout…' : ctaLabel}
        </span>
      </ShopCtaButton>

      {showBuyNow && (
        <ShopCtaButton
          variant="ghost"
          size="card"
          className="!h-8 text-[13px]"
          disabled={!produit.en_stock || adding}
          onClick={handleBuyNow}
          aria-label={`Acheter maintenant — ${produit.nom}`}
        >
          Acheter maintenant
        </ShopCtaButton>
      )}
    </article>
  );
};
