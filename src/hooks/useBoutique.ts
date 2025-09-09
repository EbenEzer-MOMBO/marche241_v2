/**
 * Hook pour la gestion des données de boutique
 */

import { useState, useEffect } from 'react';
import { Boutique } from '@/lib/database-types';
import { getBoutiqueBySlug, getBoutiqueConfig } from '@/lib/boutiques';
import type { BoutiqueConfig } from '@/lib/boutiques';

interface UseBoutiqueResult {
  boutique: Boutique | null;
  config: BoutiqueConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les données d'une boutique
 * @param slug - Le slug de la boutique
 * @returns Données de la boutique, configuration, état de chargement et fonction de rechargement
 */
export function useBoutique(slug: string): UseBoutiqueResult {
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [config, setConfig] = useState<BoutiqueConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoutique = async () => {
    if (!slug) {
      setError('Slug de boutique requis');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupération en parallèle des données API et de la configuration
      const [boutiqueData, configData] = await Promise.all([
        getBoutiqueBySlug(slug),
        getBoutiqueConfig(slug)
      ]);

      setBoutique(boutiqueData);
      setConfig(configData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération de la boutique:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchBoutique();
  };

  useEffect(() => {
    fetchBoutique();
  }, [slug]);

  return {
    boutique,
    config,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer uniquement la configuration d'une boutique (plus léger)
 * @param slug - Le slug de la boutique
 * @returns Configuration de la boutique et état de chargement
 */
export function useBoutiqueConfig(slug: string) {
  const [config, setConfig] = useState<BoutiqueConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Slug de boutique requis');
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const configData = await getBoutiqueConfig(slug);
        setConfig(configData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('Erreur lors de la récupération de la configuration:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [slug]);

  return { config, loading, error };
}

export default useBoutique;
