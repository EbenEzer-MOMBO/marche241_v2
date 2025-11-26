/**
 * Hook pour la gestion des catégories
 */

import { useState, useEffect } from 'react';
import { Categorie } from '@/lib/database-types';
import { getCategoriesParBoutique, organiserCategoriesHierarchie, filtrerCategoriesActives } from '@/lib/services/categories';

interface UseCategoriesResult {
  categories: Categorie[];
  categoriesHierarchie: Categorie[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les catégories d'une boutique
 * @param boutiqueId - L'ID de la boutique
 * @param organiserEnHierarchie - Si true, organise les catégories en hiérarchie parent/enfant
 * @param uniquementActives - Si true, filtre pour ne garder que les catégories actives
 * @returns Catégories, état de chargement et fonction de rechargement
 */
export function useCategories(
  boutiqueId: number,
  organiserEnHierarchie: boolean = false,
  uniquementActives: boolean = true
): UseCategoriesResult {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [categoriesHierarchie, setCategoriesHierarchie] = useState<Categorie[]>([]);
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
      
      let categoriesData = await getCategoriesParBoutique(boutiqueId);
      
      // Charger les produits pour corriger le nombre_produits des catégories globales
      const { getProduitsParBoutique: getProduitsService } = await import('@/lib/services/products');
      const produitsResponse = await getProduitsService(boutiqueId, { limite: 100 });
      const produitsBoutique = produitsResponse.donnees || [];
      
      // Corriger le nombre_produits pour les catégories globales
      categoriesData = categoriesData.map(cat => {
        // Pour les catégories globales, compter uniquement les produits de cette boutique
        if (!cat.boutique_id) {
          const nombreProduitsBoutique = produitsBoutique.filter(p => p.categorie_id === cat.id).length;
          return { ...cat, nombre_produits: nombreProduitsBoutique };
        }
        return cat;
      });
      
      // Filtrer les catégories actives si demandé
      if (uniquementActives) {
        categoriesData = filtrerCategoriesActives(categoriesData);
      }
      
      setCategories(categoriesData);
      
      // Organiser en hiérarchie si demandé
      if (organiserEnHierarchie) {
        const hierarchie = organiserCategoriesHierarchie(categoriesData);
        setCategoriesHierarchie(hierarchie);
      } else {
        // Trier par ordre d'affichage pour la liste plate
        const categoriesTriees = [...categoriesData].sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        setCategoriesHierarchie(categoriesTriees);
      }
      
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
  }, [boutiqueId, organiserEnHierarchie, uniquementActives]);

  return {
    categories,
    categoriesHierarchie,
    loading,
    error,
    refetch,
  };
}

export default useCategories;
