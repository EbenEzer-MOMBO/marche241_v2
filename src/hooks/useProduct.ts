/**
 * Hook pour la gestion d'un produit individuel
 */

import { useState, useEffect } from 'react';
import { ProduitDetail } from '@/lib/database-types';
import { getProduitById, getProduitBySlug, formatApiProduitPourDetail } from '@/lib/services/produits';

interface UseProductResult {
  product: ProduitDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer un produit par son ID
 * @param productId - L'ID du produit
 * @returns Produit, état de chargement et fonction de rechargement
 */
export function useProductById(productId: string | number | null): UseProductResult {
  const [product, setProduct] = useState<ProduitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!productId) {
      setError('ID de produit requis');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const produitData = await getProduitById(Number(productId));
      
      // Formater les données pour l'affichage détaillé
      const formattedProduct = formatApiProduitPourDetail({
        success: true,
        produit: produitData
      });
      
      if (formattedProduct) {
        setProduct(formattedProduct);
      } else {
        setError('Produit introuvable');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération du produit:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchProduct();
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook pour récupérer un produit par son slug
 * @param productSlug - Le slug du produit
 * @param boutiqueId - L'ID de la boutique (optionnel)
 * @returns Produit, état de chargement et fonction de rechargement
 */
export function useProductBySlug(
  productSlug: string | null, 
  boutiqueId?: number
): UseProductResult {
  const [product, setProduct] = useState<ProduitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!productSlug) {
      setError('Slug de produit requis');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const produitData = await getProduitBySlug(productSlug, boutiqueId);
      
      // Formater les données pour l'affichage détaillé
      const formattedProduct = formatApiProduitPourDetail({
        success: true,
        produit: produitData
      });
      
      if (formattedProduct) {
        setProduct(formattedProduct);
      } else {
        setError('Produit introuvable');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la récupération du produit:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchProduct();
  };

  useEffect(() => {
    fetchProduct();
  }, [productSlug, boutiqueId]);

  return {
    product,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook générique pour récupérer un produit par ID ou slug
 * @param options - Options de récupération
 * @returns Produit, état de chargement et fonction de rechargement
 */
export function useProduct(options: {
  id?: string | number | null;
  slug?: string | null;
  boutiqueId?: number;
}): UseProductResult {
  const { id, slug, boutiqueId } = options;
  
  // Utiliser le hook approprié selon les paramètres fournis
  if (id) {
    return useProductById(id);
  } else if (slug) {
    return useProductBySlug(slug, boutiqueId);
  } else {
    // Retourner un état d'erreur si aucun identifiant n'est fourni
    return {
      product: null,
      loading: false,
      error: 'Aucun identifiant de produit fourni (ID ou slug)',
      refetch: async () => {}
    };
  }
}

export default {
  useProductById,
  useProductBySlug,
  useProduct
};
