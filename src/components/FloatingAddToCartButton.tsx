'use client';

import { formatPrice } from '@/lib/utils';

interface FloatingAddToCartButtonProps {
  productName: string;
  productImage: string;
  /** Prix unitaire de base (variant ou produit) */
  price: number;
  /** Supplément personnalisations par unité (inclus dans le total affiché) */
  supplementPerUnit?: number;
  quantity: number;
  onQuantityChange?: (next: number) => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
  onAddToCart: () => void;
  onBuyNow?: () => void;
  disabled?: boolean;
  loading?: boolean;
  primaryLabel?: string;
  hideSecondary?: boolean;
}

export default function FloatingAddToCartButton({
  price,
  supplementPerUnit = 0,
  quantity,
  onQuantityChange,
  canDecrease = quantity > 1,
  canIncrease = true,
  onAddToCart,
  onBuyNow,
  disabled = false,
  loading = false,
  primaryLabel = 'Acheter',
  hideSecondary = false,
}: FloatingAddToCartButtonProps) {
  const totalPrice = (price + supplementPerUnit) * quantity;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ececea] bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(23,24,26,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-lg flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          {onQuantityChange && (
            <div className="flex h-12 items-center rounded-[10px] border border-[#e6e4df]">
              <button
                type="button"
                className="h-full w-10 text-lg text-[#17181a] disabled:opacity-40"
                disabled={!canDecrease || disabled || loading}
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="min-w-8 text-center font-mono text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                className="h-full w-10 text-lg text-[#17181a] disabled:opacity-40"
                disabled={!canIncrease || disabled || loading}
                onClick={() => onQuantityChange(quantity + 1)}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onBuyNow || onAddToCart}
            disabled={disabled || loading}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] px-3 text-[14.5px] font-semibold disabled:cursor-not-allowed disabled:bg-[#c0beb8] disabled:text-white"
            style={{
              backgroundColor: disabled
                ? undefined
                : 'var(--color-shop-primary, var(--primary-color))',
              color: disabled ? undefined : 'var(--shop-cta-fg, #fff)',
            }}
            aria-label={primaryLabel}
          >
            {loading
              ? '…'
              : `${primaryLabel} · ${formatPrice(totalPrice)}`}
          </button>
        </div>
        {!hideSecondary && (
          <button
            type="button"
            onClick={onAddToCart}
            disabled={disabled || loading}
            className="flex h-11 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[#17181a] text-[14px] font-semibold text-[#17181a] disabled:opacity-50"
            aria-label="Ajouter au panier"
          >
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}
