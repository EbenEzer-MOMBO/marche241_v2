'use client';

import { useEffect, useState } from 'react';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { Boutique } from '@/lib/database-types';

const isBoutiqueWithLogo = (boutique: Boutique) =>
  Boolean(boutique.nombre_produits && boutique.nombre_produits > 0 && boutique.logo?.trim());

export const useLandingBoutiques = () => {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBoutiques = async () => {
      try {
        const data = await getAllBoutiquesActives();
        const sorted = data
          .filter(isBoutiqueWithLogo)
          .sort((a, b) => (b.nombre_vues || 0) - (a.nombre_vues || 0));

        if (isMounted) {
          setBoutiques(sorted);
        }
      } catch (error) {
        console.error('Erreur chargement boutiques landing:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBoutiques();

    return () => {
      isMounted = false;
    };
  }, []);

  return { boutiques, isLoading, count: boutiques.length };
};
