/**
 * Hook pour la gestion des produits
 */

import { useState, useEffect } from 'react';
import { ProduitDB, CategorieAvecProduits } from '@/lib/database-types';
import { getProduitsParCategorie, getProduitsParBoutique } from '@/lib/services/produits';

interface UseProduitsParCategorieResult {
  categories: {[slug: string]: CategorieAvecProduits} | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseProduitsResult {
  produits: ProduitDB[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les produits groupés par catégorie
 * @param boutiqueId - L'ID de la boutique
 * @returns Produits groupés par catégorie, état de chargement et fonction de rechargement
 */
export function useProduitsParCategorie(boutiqueId: number): UseProduitsParCategorieResult {
  const [categories, setCategories] = useState<{[slug: string]: CategorieAvecProduits} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!boutiqueId) {
      setError('ID de boutique requis');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await getProduitsParCategorie(boutiqueId);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération des catégories:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, [boutiqueId]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer les produits d'une boutique avec options
 * @param boutiqueId - L'ID de la boutique
 * @param options - Options de pagination et filtres
 * @returns Produits, état de chargement et fonction de rechargement
 */
export function useProduits(
  boutiqueId: number,
  options?: {
    page?: number;
    limite?: number;
    categorie_id?: number;
    featured?: boolean;
    nouveaux?: boolean;
    promotion?: boolean;
  }
): UseProduitsResult {
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduits = async () => {
    if (!boutiqueId) {
      setError('ID de boutique requis');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getProduitsParBoutique(boutiqueId, options);
      setProduits(result.produits);
      setTotal(result.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération des produits:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchProduits();
  };

  useEffect(() => {
    fetchProduits();
  }, [boutiqueId, JSON.stringify(options)]);

  return {
    produits,
    total,
    loading,
    error,
    refetch,
  };
}

export default {
  useProduitsParCategorie,
  useProduits
};
