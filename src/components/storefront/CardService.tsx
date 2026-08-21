'use client';

import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { formatPrix, getProduitImageUrl } from '@/lib/services/produits';

export interface CardServiceData {
  id: number;
  nom: string;
  prix: number;
  image_principale?: string | null;
  dureeBadge?: string;
  dureeLine?: string;
  lieu?: string;
  dispoLine?: string;
  dispoOk?: boolean;
  unitLabel?: string;
  surDevis?: boolean;
  en_stock?: boolean;
}

interface CardServiceProps {
  service: CardServiceData;
  boutiqueSlug: string;
  onBook?: () => void;
}

export const CardService = ({
  service,
  boutiqueSlug,
  onBook,
}: CardServiceProps) => {
  const href = `/${boutiqueSlug}/produit/${service.id}`;
  const available = service.en_stock !== false;

  return (
    <article className="flex flex-col gap-2.5">
      <Link
        href={href}
        className="group relative block aspect-[3/2] overflow-hidden rounded-[10px] bg-[#f4f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/40"
        aria-label={service.nom}
      >
        <SafeImage
          src={getProduitImageUrl(service.image_principale)}
          alt={service.nom}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {service.dureeBadge && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#17181a] shadow-sm">
            {service.dureeBadge}
          </span>
        )}
      </Link>

      <Link
        href={href}
        className="min-h-[38px] text-[14px] leading-[1.4] text-[#17181a] line-clamp-2 hover:opacity-70"
      >
        {service.nom}
      </Link>

      <div className="flex flex-col gap-1 border-y border-[#f0efec] py-2">
        {service.dureeLine && (
          <div className="font-mono text-[12.5px] leading-[1.4] text-[#3c4045]">
            {service.dureeLine}
          </div>
        )}
        {service.lieu && (
          <div className="font-mono text-[12.5px] leading-[1.4] text-[#8b8f95]">
            {service.lieu}
          </div>
        )}
        {service.dispoLine && (
          <div
            className={`font-mono text-[12.5px] font-medium leading-[1.4] ${
              service.dispoOk ? 'text-[#16a34a]' : 'text-[#8b8f95]'
            }`}
          >
            {service.dispoLine}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold text-[#17181a]">
          {service.surDevis
            ? `Dès ${formatPrix(service.prix)}`
            : formatPrix(service.prix)}
        </span>
        {service.unitLabel && (
          <span className="text-[12.5px] text-[#9a9892]">
            {service.unitLabel}
          </span>
        )}
      </div>

      {service.surDevis ? (
        <ShopCtaButton
          variant="secondary"
          size="card"
          disabled={!available}
          onClick={(e) => {
            e.preventDefault();
            onBook?.();
          }}
          aria-label={`Demander un devis — ${service.nom}`}
        >
          Demander un devis
        </ShopCtaButton>
      ) : (
        <ShopCtaButton
          size="card"
          disabled={!available}
          onClick={(e) => {
            e.preventDefault();
            onBook?.();
          }}
          aria-label={`Prendre rendez-vous — ${service.nom}`}
        >
          Prendre rendez-vous
        </ShopCtaButton>
      )}
    </article>
  );
};
