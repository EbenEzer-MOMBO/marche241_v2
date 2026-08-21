'use client';

import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { formatPrix, getProduitImageUrl } from '@/lib/services/produits';

export interface CardEvenementData {
  id: number;
  nom: string;
  prix: number;
  image_principale?: string | null;
  dateBadge?: string;
  dateLine?: string;
  lieu?: string;
  placesLine?: string;
  placesUrgent?: boolean;
  en_stock?: boolean;
}

interface CardEvenementProps {
  evenement: CardEvenementData;
  boutiqueSlug: string;
  onReserve?: () => void;
}

export const CardEvenement = ({
  evenement,
  boutiqueSlug,
  onReserve,
}: CardEvenementProps) => {
  const href = `/${boutiqueSlug}/produit/${evenement.id}`;
  const available = evenement.en_stock !== false;

  return (
    <article className="flex flex-col gap-2.5">
      <Link
        href={href}
        className="group relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-[#f4f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/40"
        aria-label={evenement.nom}
      >
        <SafeImage
          src={getProduitImageUrl(evenement.image_principale)}
          alt={evenement.nom}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {evenement.dateBadge && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#17181a] shadow-sm">
            {evenement.dateBadge}
          </span>
        )}
      </Link>

      <Link
        href={href}
        className="min-h-[38px] text-[14px] leading-[1.4] text-[#17181a] line-clamp-2 hover:opacity-70"
      >
        {evenement.nom}
      </Link>

      <div className="flex flex-col gap-1 border-y border-[#f0efec] py-2">
        {evenement.dateLine && (
          <div className="font-mono text-[12.5px] leading-[1.4] text-[#3c4045]">
            {evenement.dateLine}
          </div>
        )}
        {evenement.lieu && (
          <div className="font-mono text-[12.5px] leading-[1.4] text-[#8b8f95]">
            {evenement.lieu}
          </div>
        )}
        {evenement.placesLine && (
          <div
            className={`font-mono text-[12.5px] font-medium leading-[1.4] ${
              evenement.placesUrgent ? 'text-[#d97706]' : 'text-[#8b8f95]'
            }`}
          >
            {evenement.placesLine}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold text-[#17181a]">
          {formatPrix(evenement.prix)}
        </span>
        <span className="text-[12.5px] text-[#9a9892]">/ billet</span>
      </div>

      <ShopCtaButton
        size="card"
        disabled={!available}
        onClick={(e) => {
          e.preventDefault();
          onReserve?.();
        }}
        aria-label={`Réserver — ${evenement.nom}`}
      >
        Réserver
      </ShopCtaButton>
    </article>
  );
};
