'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { ProduitDetail } from '@/lib/database-types';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';

interface TicketVariant {
  id: string;
  nom: string;
  prix: number;
  prix_promo?: number;
  stock: number;
}

interface EventProductDisplayProps {
  product: ProduitDetail;
  onVariantChange: (variantId: string) => void;
  onAddToCart: () => void;
  onBuyNow?: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isAddingToCart: boolean;
  selectedVariantId?: string;
  description?: string;
}

function formatDateLine(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventProductDisplay({
  product,
  onVariantChange,
  onAddToCart,
  onBuyNow,
  quantity,
  onQuantityChange,
  isAddingToCart,
  selectedVariantId,
  description,
}: EventProductDisplayProps) {
  const meta = (product.variants as { meta?: Record<string, unknown> })?.meta || {};
  const tickets: TicketVariant[] =
    (product.variants as { variants?: TicketVariant[] })?.variants || [];

  const [selectedTicket, setSelectedTicket] = useState<TicketVariant | null>(null);

  useEffect(() => {
    if (tickets.length === 0) return;
    const fromProp = selectedVariantId
      ? tickets.find((t) => t.id === selectedVariantId)
      : null;
    const initial = fromProp || tickets.find((t) => t.stock > 0) || tickets[0];
    setSelectedTicket(initial);
    onVariantChange(initial.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTicket = (ticket: TicketVariant) => {
    if (ticket.stock <= 0) return;
    setSelectedTicket(ticket);
    onVariantChange(ticket.id);
    if (quantity > ticket.stock) {
      onQuantityChange(ticket.stock);
    }
  };

  const maxQty = selectedTicket?.stock || 1;
  const unitPrice =
    selectedTicket?.prix_promo && selectedTicket.prix_promo > 0
      ? selectedTicket.prix_promo
      : selectedTicket?.prix || product.prix;
  const soldOut = tickets.every((t) => t.stock <= 0);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#ebe9e4] bg-[#fafaf8] p-4 space-y-2">
        {typeof meta.date_debut === 'string' && (
          <p className="text-sm text-[#17181a]">
            <span className="font-medium">Date · </span>
            {formatDateLine(meta.date_debut)}
          </p>
        )}
        {typeof meta.lieu === 'string' && (
          <p className="text-sm text-[#3c4045]">
            <span className="font-medium">Lieu · </span>
            {meta.lieu}
          </p>
        )}
        {typeof meta.adresse === 'string' && meta.adresse && (
          <p className="text-sm text-[#8b8f95]">{meta.adresse}</p>
        )}
        {typeof meta.ouverture_portes === 'string' && meta.ouverture_portes && (
          <p className="text-sm text-[#8b8f95]">
            Ouverture des portes · {meta.ouverture_portes}
          </p>
        )}
        {meta.non_remboursable !== false && (
          <p className="text-xs font-medium text-[#d97706]">Billet non remboursable</p>
        )}
        <p className="text-xs text-[#5f6369]">
          Livraison immédiate par message après paiement.
        </p>
      </div>

      {description?.trim() && (
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-[#17181a]">Description</h3>
          <p className="text-[13.5px] leading-[1.6] text-[#5f6369]">{description.trim()}</p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#17181a]">Choisir un billet</h3>
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const price =
              ticket.prix_promo && ticket.prix_promo > 0
                ? ticket.prix_promo
                : ticket.prix;
            const selected = selectedTicket?.id === ticket.id;
            const disabled = ticket.stock <= 0;
            return (
              <button
                key={ticket.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectTicket(ticket)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-[var(--color-shop-primary,var(--primary-color))] bg-[color-mix(in_srgb,var(--color-shop-primary,var(--primary-color))_8%,white)]'
                    : 'border-[#ebe9e4] hover:border-[#cfcbc3]'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-pressed={selected}
                aria-label={`Billet ${ticket.nom}`}
              >
                <div>
                  <p className="text-sm font-medium text-[#17181a]">{ticket.nom}</p>
                  <p className="text-xs text-[#8b8f95]">
                    {disabled ? 'Complet' : `${ticket.stock} place${ticket.stock > 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#17181a]">{formatPrice(price)}</p>
                  {ticket.prix_promo && ticket.prix_promo > 0 && (
                    <p className="text-xs text-[#8b8f95] line-through">
                      {formatPrice(ticket.prix)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!soldOut && selectedTicket && (
        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-sm text-[#5f6369]">Nombre de billets</span>
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
              className="px-3 py-2 text-sm disabled:opacity-40"
              disabled={quantity >= maxQty}
              onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
          <span className="ml-auto text-sm font-semibold text-[#17181a]">
            {formatPrice(unitPrice * quantity)}
          </span>
        </div>
      )}

      <div className="hidden flex-col gap-2 lg:flex">
        <ShopCtaButton
          size="lg"
          disabled={soldOut || isAddingToCart || !selectedTicket}
          onClick={onBuyNow || onAddToCart}
          aria-label={`Réserver ${quantity} billet${quantity > 1 ? 's' : ''}`}
        >
          {soldOut
            ? 'Complet'
            : isAddingToCart
              ? 'Réservation…'
              : `Réserver ${quantity} billet${quantity > 1 ? 's' : ''}`}
        </ShopCtaButton>
        <p className="text-center text-[12.5px] leading-[1.5] text-[#8b8f95]">
          Livraison immédiate par message après paiement.
          {meta.non_remboursable !== false ? ' Non remboursable.' : ''}
        </p>
      </div>
    </div>
  );
}
