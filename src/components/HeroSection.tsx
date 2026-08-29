'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { useBoutique } from '@/hooks/useBoutique';
import { HeroSkeleton, ErrorState } from './LoadingStates';
import SafeImage from './SafeImage';
import { BoutiqueTrustSignals } from './storefront/BoutiqueTrustSignals';
import { getCommunesActives } from '@/lib/services/communes';
import { formatDelaiLivraison } from '@/lib/utils/delai-livraison';

interface HeroSectionProps {
  boutiqueName: string;
}

const getBoutiqueLogo = (logoUrl?: string | null): string => {
  if (logoUrl && logoUrl.trim() !== '') {
    try {
      new URL(logoUrl);
      return logoUrl;
    } catch {
      return '/default-shop.png';
    }
  }
  return '/default-shop.png';
};

const DESCRIPTION_PREVIEW_MAX = 160;

export default function HeroSection({ boutiqueName }: HeroSectionProps) {
  const { boutique, config, loading, error, refetch } = useBoutique(boutiqueName);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [delaiLivraisonLabel, setDelaiLivraisonLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!boutique?.id) return;

    let cancelled = false;

    getCommunesActives(boutique.id)
      .then((communes) => {
        if (cancelled || communes.length === 0) return;

        const min = Math.min(...communes.map((c) => c.delai_livraison_min));
        const max = Math.max(...communes.map((c) => c.delai_livraison_max));
        setDelaiLivraisonLabel(formatDelaiLivraison(min, max));
      })
      .catch(() => {
        // Garde le texte par défaut en cas d'échec du chargement des communes
      });

    return () => {
      cancelled = true;
    };
  }, [boutique?.id]);

  const trustItems = useMemo(() => {
    return [
      {
        title: delaiLivraisonLabel || 'Livraison rapide',
        subtitle: boutique?.adresse
          ? boutique.adresse
          : 'Libreville et environs',
      },
      {
        title: 'Moov · Airtel · Visa',
        subtitle: 'ou paiement à la livraison',
      },
      {
        title: boutique?.nom || 'Boutique',
        subtitle: boutique?.ville || boutique?.adresse || 'Libreville',
      },
    ];
  }, [boutique?.adresse, boutique?.nom, boutique?.ville, delaiLivraisonLabel]);

  if (loading) {
    return <HeroSkeleton />;
  }

  if (error || !config) {
    return (
      <ErrorState
        title="Boutique introuvable"
        message={error || 'Impossible de charger les informations de la boutique'}
        onRetry={refetch}
      />
    );
  }

  const fullDescription = (config.description ?? '').trim();
  const isExpandable = fullDescription.length > DESCRIPTION_PREVIEW_MAX;
  const preview = isExpandable
    ? `${fullDescription.slice(0, DESCRIPTION_PREVIEW_MAX).trim()}…`
    : fullDescription;

  return (
    <section className="border-b border-[#ececea]">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="relative">
          <div
            className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
            style={{ paddingBottom: 'clamp(28%, 26vw, 26%)' }}
          >
            {boutique?.banniere ? (
              <SafeImage
                src={boutique.banniere}
                alt={`${config.name} bannière`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 sm:-bottom-12">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28">
              <SafeImage
                src={getBoutiqueLogo(boutique?.logo)}
                alt={`${config.name} logo`}
                width={112}
                height={112}
                className="h-full w-full rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-14 pb-5 text-center sm:mt-16 sm:pb-7">
          <h1 className="mb-2 flex items-center justify-center gap-1.5 text-2xl font-bold text-[#17181a] sm:mb-3 sm:text-3xl lg:text-4xl">
            {config.name}
            {config.estVerifiee && (
              <BadgeCheck
                className="h-6 w-6 shrink-0 fill-[#3B82F6] text-white sm:h-7 sm:w-7"
                aria-label="Boutique vérifiée"
              />
            )}
          </h1>

          {fullDescription ? (
            <div className="mx-auto max-w-3xl px-1 text-[14.5px] leading-relaxed text-[#5f6369] sm:text-base">
              <p>
                {descriptionExpanded || !isExpandable ? fullDescription : preview}{' '}
                {isExpandable && (
                  <button
                    type="button"
                    onClick={() => setDescriptionExpanded((v) => !v)}
                    className="font-medium focus:outline-none focus-visible:underline"
                    style={{
                      color: 'var(--color-shop-primary, var(--primary-color))',
                    }}
                    aria-expanded={descriptionExpanded}
                  >
                    {descriptionExpanded ? 'Réduire' : 'En savoir plus'}
                  </button>
                )}
              </p>
            </div>
          ) : null}

          <div className="mx-auto mt-4 max-w-3xl sm:mt-5">
            <BoutiqueTrustSignals
              items={trustItems}
              className="hidden justify-center sm:flex"
            />
            <BoutiqueTrustSignals
              items={trustItems}
              variant="pills"
              className="justify-center sm:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
