'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Boutique } from '@/lib/database-types';

interface BoutiqueLogoStripProps {
  boutiques: Boutique[];
}

export const BoutiqueLogoStrip: React.FC<BoutiqueLogoStripProps> = ({ boutiques }) => {
  const logos = boutiques.slice(0, 8);

  if (logos.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-gray-200 bg-[#fafafa]">
      <div className="container mx-auto px-4 lg:px-10 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm font-medium text-gray-500 shrink-0">
          Ils vendent déjà sur Marché241
        </p>
        <div className="flex items-center justify-evenly gap-3 overflow-x-auto scrollbar-none pb-1 sm:pb-0 sm:flex-1 sm:overflow-visible">
          {logos.map((boutique) => (
            <Link
              key={boutique.id}
              href={`/${boutique.slug}`}
              className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-100 bg-white overflow-hidden hover:border-[#74adaf] transition-colors shadow-sm"
              aria-label={`Voir la boutique ${boutique.nom}`}
            >
              {boutique.logo ? (
                <Image
                  src={boutique.logo}
                  alt={boutique.nom}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-mono px-1 text-center leading-tight">
                  {boutique.nom}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
