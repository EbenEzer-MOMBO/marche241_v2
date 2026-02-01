import { useState, useEffect } from 'react';
import { 
  getStatistiquesVuesBoutique, 
  getStatistiquesVuesProduit,
  StatistiquesVuesBoutique,
  StatistiquesVuesProduit 
} from '@/lib/services/vues';

/**
 * Hook pour récupérer les statistiques de vues d'une boutique
 * @param boutiqueId - ID de la boutique
 * @returns { stats, isLoading, error, refresh }
 */
export function useStatistiquesVuesBoutique(boutiqueId: number | null) {
  const [stats, setStats] = useState<StatistiquesVuesBoutique | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!boutiqueId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getStatistiquesVuesBoutique(boutiqueId);
      setStats(response.statistiques);
    } catch (err: any) {
      console.error('Erreur lors du chargement des stats de vues:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
      
      // Définir des stats par défaut en cas d'erreur
      setStats({
        nombre_vues_total: 0,
        vues_totales: 0,
        vues_aujourd_hui: 0,
        vues_7_jours: 0,
        vues_30_jours: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [boutiqueId]);

  return {
    stats,
    isLoading,
    error,
    refresh: loadStats,
  };
}

/**
 * Hook pour récupérer les statistiques de vues d'un produit
 * @param produitId - ID du produit
 * @returns { stats, isLoading, error, refresh }
 */
export function useStatistiquesVuesProduit(produitId: number | null) {
  const [stats, setStats] = useState<StatistiquesVuesProduit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!produitId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getStatistiquesVuesProduit(produitId);
      setStats(response.statistiques);
    } catch (err: any) {
      console.error('Erreur lors du chargement des stats de vues du produit:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
      
      // Définir des stats par défaut en cas d'erreur
      setStats({
        nombre_vues_total: 0,
        vues_totales: 0,
        vues_aujourd_hui: 0,
        vues_7_jours: 0,
        vues_30_jours: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [produitId]);

  return {
    stats,
    isLoading,
    error,
    refresh: loadStats,
  };
}
