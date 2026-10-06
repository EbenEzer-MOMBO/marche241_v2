'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StatutGuideVendeur } from '@/lib/database-types';
import { CodeGuide, EtatGuides, enregistrerGuide, getGuides } from '@/lib/services/guides';

/**
 * État d'une visite guidée du vendeur connecté.
 * - Un seul appel API partagé entre la sidebar et la page (cache du module).
 * - Copie dans le localStorage : pas de clignotement de la pastille « Nouveau », et pas de visite
 *   rejouée si l'API est indisponible.
 */

const CLE_LOCALE = (guide: CodeGuide) => `m241_guide_${guide}`;

let cache: EtatGuides | null = null;
let chargement: Promise<EtatGuides> | null = null;
const abonnes = new Set<() => void>();

function lireLocal(guide: CodeGuide): StatutGuideVendeur | null {
  try {
    const v = localStorage.getItem(CLE_LOCALE(guide));
    return v === 'termine' || v === 'ignore' ? v : null;
  } catch {
    return null;
  }
}

function ecrireLocal(guide: CodeGuide, statut: StatutGuideVendeur): void {
  try {
    localStorage.setItem(CLE_LOCALE(guide), statut);
  } catch {
    // stockage indisponible (navigation privée) : l'état reste en mémoire et en base
  }
}

function chargerGuides(): Promise<EtatGuides> {
  chargement ??= getGuides()
    .then((g) => {
      cache = g;
      abonnes.forEach((f) => f());
      return g;
    })
    .catch(() => {
      chargement = null;
      return {};
    });
  return chargement;
}

export function useGuide(guide: CodeGuide) {
  const statutConnu = (): StatutGuideVendeur | null => cache?.[guide]?.statut ?? lireLocal(guide);
  const [statut, setStatut] = useState<StatutGuideVendeur | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setStatut(statutConnu());
    const maj = () => setStatut(statutConnu());
    abonnes.add(maj);
    void chargerGuides().then(() => {
      maj();
      setPret(true);
    });
    return () => {
      abonnes.delete(maj);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guide]);

  const enregistrer = useCallback(
    async (nouveau: StatutGuideVendeur) => {
      // Une visite terminée ne redevient pas « passée » (même règle que l'API)
      const final: StatutGuideVendeur = cache?.[guide]?.statut === 'termine' ? 'termine' : nouveau;
      ecrireLocal(guide, final);
      cache = { ...(cache ?? {}), [guide]: { statut: final, date_modification: new Date().toISOString() } };
      abonnes.forEach((f) => f());
      try {
        await enregistrerGuide(guide, final);
      } catch {
        // l'état local suffit à ne pas rejouer la visite ; il sera renvoyé à la prochaine fin de visite
      }
    },
    [guide]
  );

  return {
    /** null tant que la visite n'a été ni terminée ni passée */
    statut,
    /** vrai une fois l'état lu en base (ou l'API en échec) : la visite peut démarrer */
    pret,
    vue: statut !== null,
    enregistrer
  };
}
