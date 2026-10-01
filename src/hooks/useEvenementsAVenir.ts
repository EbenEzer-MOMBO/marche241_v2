'use client';

import { useEffect, useState } from 'react';
import { getEvenementsAVenir, type EvenementPublic } from '@/lib/services/evenements';

export const useEvenementsAVenir = () => {
  const [evenements, setEvenements] = useState<EvenementPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getEvenementsAVenir()
      .then((data) => {
        if (isMounted) setEvenements(data);
      })
      .catch((err) => {
        console.error('Erreur chargement événements:', err);
        if (isMounted) setError('Impossible de charger les événements');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { evenements, isLoading, error };
};
