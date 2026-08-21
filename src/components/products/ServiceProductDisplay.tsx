'use client';

import { Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ProduitDetail, Boutique } from '@/lib/database-types';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';

interface ServiceProductDisplayProps {
  product: ProduitDetail;
  boutique: Boutique;
  onAddToCart: () => void;
  onBuyNow?: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isAddingToCart: boolean;
}

export function ServiceProductDisplay({
  product,
  boutique: _boutique,
  onAddToCart,
  onBuyNow,
  quantity,
  onQuantityChange,
  isAddingToCart,
}: ServiceProductDisplayProps) {
  const meta = (product.variants as { meta?: Record<string, unknown> })?.meta || {};
  const surDevis = Boolean(meta.sur_devis);
  const inclus = Array.isArray(meta.inclus)
    ? (meta.inclus as string[])
    : typeof meta.inclus === 'string'
      ? [meta.inclus]
      : [];
  const unitLabel =
    typeof meta.unit_label === 'string' && meta.unit_label ? meta.unit_label : 'séance';
  const prixPromo =
    product.prix_original && product.prix_original > product.prix
      ? product.prix
      : undefined;
  const prixAffiche = prixPromo ?? product.prix;
  const prixBarre =
    product.prix_original && product.prix_original > product.prix
      ? product.prix_original
      : undefined;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#ebe9e4] bg-[#fafaf8] p-4 space-y-2">
        {typeof meta.duree === 'string' && (
          <p className="text-sm text-[#17181a]">
            <span className="font-medium">Durée · </span>
            {meta.duree}
          </p>
        )}
        {typeof meta.lieu === 'string' && (
          <p className="text-sm text-[#3c4045]">
            <span className="font-medium">Lieu · </span>
            {meta.lieu}
          </p>
        )}
        {typeof meta.dispo_label === 'string' && meta.dispo_label && (
          <p className="text-sm text-[#16a34a]">{meta.dispo_label}</p>
        )}
        {typeof meta.politique_annulation === 'string' && meta.politique_annulation && (
          <p className="text-xs text-[#8b8f95]">{meta.politique_annulation}</p>
        )}
      </div>

      {inclus.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#17181a]">Inclus</h3>
          <ul className="space-y-1.5">
            {inclus.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#3c4045]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {surDevis ? (
        <div className="space-y-3">
          <p className="text-lg font-semibold text-[#17181a]">Sur devis</p>
          <ShopCtaButton
            fullWidth
            disabled={isAddingToCart}
            onClick={onBuyNow || onAddToCart}
            aria-label="Demander un devis"
          >
            {isAddingToCart ? 'Envoi…' : 'Demander un devis'}
          </ShopCtaButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden items-baseline gap-2 lg:flex">
            <span className="text-2xl font-semibold text-[#17181a]">
              {formatPrice(prixAffiche)}
            </span>
            <span className="text-sm text-[#8b8f95]">/ {unitLabel}</span>
            {prixBarre && (
              <span className="text-sm text-[#8b8f95] line-through">
                {formatPrice(prixBarre)}
              </span>
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-sm text-[#5f6369]">Quantité</span>
            <div className="flex items-center rounded-lg border border-[#ebe9e4]">
              <button
                type="button"
                className="px-3 py-2 text-sm disabled:opacity-40"
                disabled={quantity <= 1}
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2 text-sm"
                onClick={() => onQuantityChange(quantity + 1)}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA unique : la prestation se réserve, elle ne s'empile pas dans un panier */}
          <div className="hidden flex-col gap-2 lg:flex">
            <ShopCtaButton
              size="lg"
              disabled={isAddingToCart}
              onClick={onBuyNow || onAddToCart}
              aria-label="Prendre rendez-vous"
            >
              {isAddingToCart ? 'Réservation…' : 'Prendre rendez-vous'}
            </ShopCtaButton>
            <p className="text-center text-[12.5px] leading-[1.5] text-[#8b8f95]">
              Confirmation après paiement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
