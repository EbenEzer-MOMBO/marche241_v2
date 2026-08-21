'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Boutique } from '@/lib/database-types';

interface BoutiqueCardProps {
  boutique: Boutique;
  featured?: boolean;
}

export const BoutiqueCard: React.FC<BoutiqueCardProps> = ({
  boutique,
  featured = false,
}) => {
  const productCount = boutique.nombre_produits || 0;
  const ctaLabel =
    productCount > 0 ? `Voir les ${productCount} produits` : 'Voir la boutique';
  const coverImage =
    boutique.banniere?.trim() || boutique.logo?.trim() || null;
  const isLogoFallback = !boutique.banniere?.trim() && Boolean(boutique.logo?.trim());

  return (
    <Link
      href={`/${boutique.slug}`}
      className={`group flex flex-col border border-gray-200 rounded-[14px] overflow-hidden bg-white transition-all hover:shadow-[0_10px_26px_rgba(0,0,0,0.1)] ${
        featured ? 'outline outline-2 outline-[#508e27]/50 -outline-offset-1' : ''
      }`}
      aria-label={`${ctaLabel} — ${boutique.nom}`}
    >
      <div className="relative h-[150px] bg-gray-100 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={boutique.nom}
            fill
            className={`${
              isLogoFallback ? 'object-contain p-6 bg-white' : 'object-cover'
            } group-hover:scale-105 transition-transform duration-500`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        {boutique.ville?.trim() && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-gray-900/82 text-white text-[11px] font-semibold">
            {boutique.ville.trim()}
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{boutique.nom}</h3>
        {(boutique.adresse || boutique.ville?.trim()) && (
          <p className="text-[13px] text-gray-500 line-clamp-1">
            {boutique.adresse || boutique.ville?.trim()}
          </p>
        )}
        {boutique.description && (
          <p className="text-[13px] leading-relaxed text-gray-600 line-clamp-2">
            {boutique.description}
          </p>
        )}

        <div className="flex items-center gap-2.5 pt-1 mt-auto">
          {productCount > 0 && (
            <span className="px-2.5 py-1 rounded-[7px] bg-gray-100 text-xs font-semibold text-gray-700">
              {productCount} produit{productCount > 1 ? 's' : ''}
            </span>
          )}
          {(boutique.nombre_vues || 0) > 0 && (
            <span className="text-xs text-gray-500">
              {boutique.nombre_vues.toLocaleString('fr-FR')} visites
            </span>
          )}
        </div>

        <div
          className={`mt-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-sm font-semibold transition-colors ${
            featured
              ? 'bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white'
              : 'border border-gray-300 text-gray-700 group-hover:border-[#508e27] group-hover:text-[#508e27]'
          }`}
        >
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
};
