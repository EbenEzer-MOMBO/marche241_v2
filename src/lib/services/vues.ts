/**
 * Service pour la gestion du tracking des vues (boutiques et produits)
 */

import api from '@/lib/api';

/**
 * Interface pour les statistiques de vues d'une boutique
 */
export interface StatistiquesVuesBoutique {
  nombre_vues_total: number;
  vues_totales: number;
  vues_aujourd_hui: number;
  vues_7_jours: number;
  vues_30_jours: number;
}

/**
 * Interface pour la réponse des stats d'une boutique
 */
export interface StatsBoutiqueResponse {
  success: boolean;
  boutique_id: number;
  nom_boutique: string;
  statistiques: StatistiquesVuesBoutique;
}

/**
 * Interface pour les statistiques de vues d'un produit
 */
export interface StatistiquesVuesProduit {
  nombre_vues_total: number;
  vues_totales: number;
  vues_aujourd_hui: number;
  vues_7_jours: number;
  vues_30_jours: number;
}

/**
 * Interface pour la réponse des stats d'un produit
 */
export interface StatsProduitResponse {
  success: boolean;
  produit_id: number;
  nom_produit: string;
  statistiques: StatistiquesVuesProduit;
}

/**
 * Récupérer les statistiques de vues d'une boutique
 * @param boutiqueId - ID de la boutique
 * @returns Promise<StatsBoutiqueResponse>
 */
export async function getStatistiquesVuesBoutique(
  boutiqueId: number
): Promise<StatsBoutiqueResponse> {
  try {
    const response = await api.get<StatsBoutiqueResponse>(
      `/boutiques/${boutiqueId}/stats`
    );
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des stats de vues:', error);
    
    // Retourner des valeurs par défaut en cas d'erreur
    if (error.status === 404) {
      throw new Error('Boutique non trouvée');
    } else if (error.status === 403) {
      throw new Error('Non autorisé à voir ces statistiques');
    } else if (error.status === 401) {
      throw new Error('Authentification requise');
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible de récupérer les statistiques de vues');
  }
}

/**
 * Récupérer les statistiques de vues d'un produit
 * @param produitId - ID du produit
 * @returns Promise<StatsProduitResponse>
 */
export async function getStatistiquesVuesProduit(
  produitId: number
): Promise<StatsProduitResponse> {
  try {
    const response = await api.get<StatsProduitResponse>(
      `/produits/${produitId}/stats`
    );
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des stats de vues du produit:', error);
    
    // Retourner des valeurs par défaut en cas d'erreur
    if (error.status === 404) {
      throw new Error('Produit non trouvé');
    } else if (error.status === 401) {
      throw new Error('Authentification requise');
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible de récupérer les statistiques de vues du produit');
  }
}

/**
 * Récupérer uniquement les vues du mois et le total pour le dashboard
 * @param boutiqueId - ID de la boutique
 * @returns Promise<{ vues_mois: number, vues_total: number }>
 */
export async function getVuesBoutiqueDashboard(
  boutiqueId: number
): Promise<{ vues_mois: number; vues_total: number }> {
  try {
    const stats = await getStatistiquesVuesBoutique(boutiqueId);
    
    return {
      vues_mois: stats.statistiques.vues_30_jours,
      vues_total: stats.statistiques.nombre_vues_total,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des vues pour le dashboard:', error);
    
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      vues_mois: 0,
      vues_total: 0,
    };
  }
}

/**
 * Récupérer les statistiques de vues de plusieurs produits
 * Utile pour afficher les stats sur une liste de produits
 * @param produitsIds - Array d'IDs de produits
 * @returns Promise<Map<number, StatistiquesVuesProduit>>
 */
export async function getStatistiquesVuesProduits(
  produitsIds: number[]
): Promise<Map<number, StatistiquesVuesProduit>> {
  const statsMap = new Map<number, StatistiquesVuesProduit>();
  
  try {
    // Récupérer les stats de chaque produit en parallèle
    const promises = produitsIds.map(id => 
      getStatistiquesVuesProduit(id)
        .then(response => ({ id, stats: response.statistiques }))
        .catch(() => ({ 
          id, 
          stats: {
            nombre_vues_total: 0,
            vues_totales: 0,
            vues_aujourd_hui: 0,
            vues_7_jours: 0,
            vues_30_jours: 0,
          } as StatistiquesVuesProduit
        }))
    );
    
    const results = await Promise.all(promises);
    
    // Construire la Map
    results.forEach(({ id, stats }) => {
      statsMap.set(id, stats);
    });
    
    return statsMap;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats de plusieurs produits:', error);
    return statsMap;
  }
}

/**
 * Interface pour un produit populaire avec son nombre de vues
 */
export interface ProduitPopulaire {
  id: number;
  nom: string;
  nombre_vues: number;
  image_principale?: string;
}

/**
 * Récupérer les produits les plus vus d'une boutique
 * @param boutiqueId - ID de la boutique
 * @param limite - Nombre de produits à retourner (défaut: 5)
 * @returns Promise<ProduitPopulaire[]>
 */
export async function getProduitsLesPlusVus(
  boutiqueId: number,
  limite: number = 5
): Promise<ProduitPopulaire[]> {
  try {
    // Cette route doit être créée dans le backend
    // Elle retourne les produits triés par nombre de vues
    const response = await api.get<{
      success: boolean;
      produits: ProduitPopulaire[];
    }>(`/boutiques/${boutiqueId}/produits/top-vues?limite=${limite}`);
    
    return response.produits || [];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits les plus vus:', error);
    
    // En attendant que le backend implémente cette route,
    // on peut retourner un tableau vide
    return [];
  }
}
