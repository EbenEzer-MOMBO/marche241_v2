/**
 * Service pour la gestion des boutiques
 */

import api from '@/lib/api';
import { ApiBoutiqueResponse, Boutique } from '@/lib/database-types';

/**
 * Récupère les paramètres d'une boutique par son slug
 * @param slug - Le slug de la boutique (ex: "marche_241")
 * @returns Promise<Boutique> - Les données de la boutique
 */
export async function getBoutiqueBySlug(slug: string): Promise<Boutique> {
  try {
    const response = await api.get<ApiBoutiqueResponse>(`/boutiques/${slug}`);
    
    if (!response.success || !response.boutique) {
      throw new Error(`Boutique "${slug}" introuvable`);
    }
    
    return response.boutique;
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    throw error;
  }
}

/**
 * Récupère les paramètres d'une boutique par son ID
 * @param id - L'ID de la boutique
 * @returns Promise<Boutique> - Les données de la boutique
 */
export async function getBoutiqueById(id: number): Promise<Boutique> {
  try {
    const response = await api.get<ApiBoutiqueResponse>(`/boutiques/${id}`);
    
    if (!response.success || !response.boutique) {
      throw new Error(`Boutique avec l'ID ${id} introuvable`);
    }
    
    return response.boutique;
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    throw error;
  }
}

/**
 * Récupère la liste de toutes les boutiques
 * @returns Promise<Boutique[]> - La liste des boutiques
 */
export async function getAllBoutiques(): Promise<Boutique[]> {
  try {
    // Le backend retourne les données paginées, on récupère toutes les boutiques
    const response = await api.get<{ 
      success?: boolean; 
      donnees?: Boutique[];
      boutiques?: Boutique[];
      total?: number;
    }>('/boutiques?limite=100');
    
    console.log('[getAllBoutiques] Réponse API:', response);
    
    // Vérifier si on a des données (certaines APIs ne renvoient pas success)
    if (response.donnees || response.boutiques) {
      const boutiques = response.donnees || response.boutiques || [];
      console.log('[getAllBoutiques] Nombre de boutiques récupérées:', boutiques.length);
      return boutiques;
    }
    
    // Si pas de données et success = false, erreur
    if (response.success === false) {
      throw new Error('Erreur lors de la récupération des boutiques');
    }
    
    // Sinon retourner un tableau vide
    console.warn('[getAllBoutiques] Aucune donnée trouvée dans la réponse');
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques:', error);
    throw error;
  }
}

/**
 * Récupère la liste de toutes les boutiques actives
 * @returns Promise<Boutique[]> - La liste des boutiques actives
 */
export async function getAllBoutiquesActives(): Promise<Boutique[]> {
  try {
    const boutiques = await getAllBoutiques();
    
    // Filtrer uniquement les boutiques actives
    return boutiques.filter(boutique => boutique.statut === 'active');
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques actives:', error);
    throw error;
  }
}

/**
 * Met à jour les paramètres d'une boutique
 * @param id - L'ID de la boutique
 * @param data - Les données à mettre à jour
 * @returns Promise<Boutique> - La boutique mise à jour
 */
export async function updateBoutique(
  id: number, 
  data: Partial<Boutique>
): Promise<Boutique> {
  try {
    const response = await api.put<ApiBoutiqueResponse>(`/boutiques/${id}`, data);
    
    if (!response.success || !response.boutique) {
      throw new Error('Erreur lors de la mise à jour de la boutique');
    }
    
    return response.boutique;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la boutique:', error);
    throw error;
  }
}

/**
 * Vérifie si une boutique existe par son slug
 * @param slug - Le slug de la boutique
 * @returns Promise<boolean> - true si la boutique existe
 */
export async function boutiqueExists(slug: string): Promise<boolean> {
  try {
    await getBoutiqueBySlug(slug);
    return true;
  } catch {
    return false;
  }
}

/**
 * Configuration par défaut pour une boutique
 */
export const defaultBoutiqueConfig = {
  couleur_primaire: '#000000',
  couleur_secondaire: '#ffffff',
  statut: 'active' as const,
  nombre_produits: 0,
  note_moyenne: 0,
  nombre_avis: 0,
};

/**
 * Utilitaire pour formater les couleurs de la boutique
 * @param boutique - Les données de la boutique
 * @returns Objet avec les couleurs formatées
 */
export function getBoutiqueTheme(boutique: Boutique) {
  return {
    primary: boutique.couleur_primaire || defaultBoutiqueConfig.couleur_primaire,
    secondary: boutique.couleur_secondaire || defaultBoutiqueConfig.couleur_secondaire,
    accent: '#DCD0A8', // Couleur d'accent par défaut
  };
}

export default {
  getBoutiqueBySlug,
  getBoutiqueById,
  getAllBoutiques,
  updateBoutique,
  boutiqueExists,
  getBoutiqueTheme,
};
