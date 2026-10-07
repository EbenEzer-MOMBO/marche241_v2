'use client';

import { useEffect, useRef, useState } from 'react';
import type { BannierePubliciteDiffusee, CreneauPublicite, PagePublicite } from '@/lib/database-types';
import { getBannieresPage, signalerAffichageBanniere, urlClicBanniere } from '@/lib/services/publicites';

interface BanniereSponsoriseeProps {
  /** Page publique (mesure et choix des créneaux côté API). */
  page: PagePublicite;
  /** Créneau rendu par ce composant : une page peut en afficher deux (catégorie + bandeau Premium). */
  creneau: CreneauPublicite;
  categorieId?: number | null;
  className?: string;
}

/**
 * Bannière sponsorisée d'une page publique Marché 241 (jamais sur les vitrines ni le dashboard).
 * - Rien n'est rendu sans bannière à diffuser ou en cas d'erreur.
 * - Mention « Sponsorisé » toujours visible, lien `rel="sponsored"`.
 * - L'affichage est compté une fois, quand la bannière est visible à 50 % pendant 1 seconde.
 * - Le clic passe par l'API, qui le compte puis redirige vers le lien enregistré.
 */
export function BanniereSponsorisee({ page, creneau, categorieId = null, className = '' }: BanniereSponsoriseeProps) {
  const [banniere, setBanniere] = useState<BannierePubliciteDiffusee | null>(null);
  const conteneur = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    let annule = false;
    setBanniere(null);
    getBannieresPage(page, categorieId).then((bannieres) => {
      if (!annule) setBanniere(bannieres.find((b) => b.creneau === creneau) ?? null);
    });
    return () => {
      annule = true;
    };
  }, [page, creneau, categorieId]);

  useEffect(() => {
    const element = conteneur.current;
    if (!banniere || !element || typeof IntersectionObserver === 'undefined') return;
    let minuteur: ReturnType<typeof setTimeout> | null = null;
    let compte = false;
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (compte) return;
        if (entree.isIntersecting && entree.intersectionRatio >= 0.5) {
          minuteur = setTimeout(() => {
            compte = true;
            signalerAffichageBanniere(banniere.id, page);
            observateur.disconnect();
          }, 1000);
        } else if (minuteur) {
          clearTimeout(minuteur);
          minuteur = null;
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    observateur.observe(element);
    return () => {
      if (minuteur) clearTimeout(minuteur);
      observateur.disconnect();
    };
  }, [banniere, page]);

  if (!banniere) return null;

  const externe = banniere.type_annonceur === 'externe';
  const ratioMobile = banniere.image_mobile_url ? 'aspect-[2/1]' : 'aspect-[4/1]';

  return (
    <aside className={className} aria-label="Contenu sponsorisé">
      <a
        ref={conteneur}
        href={urlClicBanniere(banniere.id, page)}
        rel={`sponsored noopener${externe ? ' noreferrer' : ''}`}
        target={externe ? '_blank' : undefined}
        className={`group relative block w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${ratioMobile} md:aspect-[4/1]`}
        data-mise-en-avant={banniere.id}
      >
        <picture>
          {banniere.image_mobile_url && <source media="(max-width: 767px)" srcSet={banniere.image_mobile_url} />}
          {/* eslint-disable-next-line @next/next/no-img-element -- visuel hébergé chez l'annonceur ou sur R2, dimensions libres */}
          <img
            src={banniere.image_url}
            alt={banniere.texte_alternatif}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </picture>
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow-sm">
          Sponsorisé
        </span>
      </a>
    </aside>
  );
}

export default BanniereSponsorisee;
