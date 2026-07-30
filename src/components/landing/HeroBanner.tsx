'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Boutique } from '@/lib/database-types';

interface HeroBannerProps {
  boutiqueCount?: number;
  featuredBoutiques?: Boutique[];
  imageSrc?: string;
}

const benefits = [
  'Sans abonnement',
  'Paiements mobile intégrés',
  'Commandes notifiées sur WhatsApp',
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  boutiqueCount = 0,
  featuredBoutiques = [],
  imageSrc = '/home1.jpg',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const previewBoutique = featuredBoutiques[0];
  const avatarBoutiques = featuredBoutiques.slice(0, 3);
  const remainingCount = Math.max(boutiqueCount - avatarBoutiques.length, 0);
  const countLabel = boutiqueCount > 0 ? boutiqueCount : '…';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt="Commerçante gabonaise — Marché241"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/82 via-black/62 to-black/45" />

      <div
        className={`relative z-20 container mx-auto px-4 lg:px-10 py-10 lg:py-[76px] transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
          <div className="flex-1 max-w-[660px] flex flex-col gap-5 lg:gap-[22px]">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full border border-white/22 bg-white/8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74adaf]" />
              <span className="text-xs lg:text-[13px] font-medium text-gray-200">
                {countLabel} boutiques déjà en ligne
              </span>
            </div>

            <h1 className="text-[32px] lg:text-[54px] leading-[1.08] lg:leading-[1.04] tracking-tight font-extrabold text-white text-balance">
              Ouvrez votre boutique en ligne{' '}
              <span className="bg-gradient-to-r from-[#508e27] to-[#74adaf] bg-clip-text text-transparent">
                en 5 minutes
              </span>
            </h1>

            <p className="text-[15px] lg:text-lg leading-relaxed text-gray-300 max-w-[540px]">
              Vous vendez déjà sur WhatsApp&nbsp;? Gardez vos clients, ajoutez un vrai catalogue,
              les paiements Airtel&nbsp;/&nbsp;Moov Money et le suivi de vos commandes.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-[22px] sm:gap-y-2.5">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 lg:w-[18px] lg:h-[18px] rounded-full bg-[#508e27]/90 text-white">
                    <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[13px] lg:text-sm text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3.5 mt-1">
              <Link
                href="/admin/register"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-[18px] rounded-[13px] bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white text-[17px] lg:text-lg font-bold shadow-[0_14px_34px_rgba(80,142,39,0.42)] hover:opacity-95 transition-all group"
              >
                Créer ma boutique gratuitement
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <p className="text-center lg:hidden text-xs text-gray-400">
                Aucune carte bancaire · 5 minutes
              </p>

              <Link
                href="/affiche_boutiques"
                className="hidden lg:inline-flex items-center justify-center px-6 py-[17px] rounded-[13px] border border-white/40 text-white text-base font-medium hover:bg-white/10 transition-colors"
              >
                Voir les {boutiqueCount > 0 ? boutiqueCount : ''} boutiques
              </Link>

              <Link
                href="/affiche_boutiques"
                className="lg:hidden text-center text-sm font-medium text-[#74adaf] underline underline-offset-2"
              >
                Voir les {boutiqueCount > 0 ? `${boutiqueCount} ` : ''}boutiques
              </Link>
            </div>

            <p className="hidden lg:block text-[13px] text-gray-400">
              Votre lien{' '}
              <span className="font-mono text-gray-300">marche241.ga/ma-boutique</span> en 5 min
            </p>

            {avatarBoutiques.length > 0 && (
              <div className="hidden lg:flex items-center gap-3 pt-1.5">
                <div className="flex">
                  {avatarBoutiques.map((boutique, index) => (
                    <div
                      key={boutique.id}
                      className={`relative w-[30px] h-[30px] rounded-full border-2 border-black overflow-hidden bg-gray-700 ${
                        index > 0 ? '-ml-2.5' : ''
                      }`}
                    >
                      {boutique.logo && (
                        <Image
                          src={boutique.logo}
                          alt={boutique.nom}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="relative -ml-2.5 w-[30px] h-[30px] rounded-full border-2 border-black bg-[#508e27] flex items-center justify-center text-[10px] font-bold text-white">
                      +{remainingCount}
                    </div>
                  )}
                </div>
                <span className="text-[13px] text-gray-400">
                  {avatarBoutiques.map((b) => b.nom).slice(0, 2).join(', ')}
                  {avatarBoutiques[2] ? `, ${avatarBoutiques[2].nom}` : ''}
                  {remainingCount > 0 ? '…' : ''} vendent déjà ici
                </span>
              </div>
            )}
          </div>

          {/* <div className="hidden lg:block relative w-[300px] shrink-0">
            <div className="w-[300px] rounded-[26px] border-8 border-gray-800 bg-white overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="h-[78px] bg-gradient-to-br from-[#508e27] to-[#74adaf] flex items-end p-3">
                <div className="relative w-11 h-11 rounded-xl bg-white overflow-hidden flex items-center justify-center">
                  {previewBoutique?.logo ? (
                    <Image
                      src={previewBoutique.logo}
                      alt={previewBoutique.nom}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-[8px] font-mono text-gray-400">logo</span>
                  )}
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-gray-900">
                    {previewBoutique?.nom ?? 'Ma Boutique'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {previewBoutique?.ville || previewBoutique?.adresse || 'Libreville'}
                    {previewBoutique?.nombre_produits
                      ? ` · ${previewBoutique.nombre_produits} produits`
                      : ' · 12 produits'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((slot) => (
                    <div
                      key={slot}
                      className="h-[74px] rounded-[9px] bg-gradient-to-br from-gray-100 to-gray-200"
                    />
                  ))}
                </div>
                <div className="h-8 rounded-[9px] bg-gray-900 flex items-center justify-center text-[11px] font-semibold text-white">
                  Acheter maintenant
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};
