'use client';

import { useEffect, useState } from 'react';
import { getBoutiqueById } from '@/lib/services/boutiques';
import { normaliserTauxMarge, TAUX_MARGE_DEFAUT } from '@/lib/constants/frais-service';

/**
 * Marge plateforme (frais de service) du vendeur d'une boutique, en % entier.
 * Vaut le taux par défaut tant que la boutique n'est pas chargée ou en cas d'erreur.
 */
export const useTauxMarge = (boutiqueId?: number): number => {
  const [taux, setTaux] = useState(TAUX_MARGE_DEFAUT);

  useEffect(() => {
    if (!boutiqueId) return;
    let annule = false;

    getBoutiqueById(boutiqueId)
      .then((boutique) => {
        if (!annule) setTaux(normaliserTauxMarge(boutique.taux_marge));
      })
      .catch(() => {
        // Taux par défaut conservé : l'affichage reste indicatif, le serveur fait foi
      });

    return () => {
      annule = true;
    };
  }, [boutiqueId]);

  return taux;
};
