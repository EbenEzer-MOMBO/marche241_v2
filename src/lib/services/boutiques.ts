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

interface BoutiquesPaginatedResponse {
  success?: boolean;
  donnees?: Boutique[];
  boutiques?: Boutique[];
  total?: number;
  page?: number;
  limite?: number;
  total_pages?: number;
}

const BOUTIQUES_PAGE_SIZE = 100;

/**
 * Récupère la liste de toutes les boutiques (toutes les pages API, max 100/page)
 * @returns Promise<Boutique[]> - La liste des boutiques
 */
export async function getAllBoutiques(): Promise<Boutique[]> {
  try {
    const allBoutiques: Boutique[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await api.get<BoutiquesPaginatedResponse>(
        `/boutiques?page=${page}&limite=${BOUTIQUES_PAGE_SIZE}`
      );

      if (response.success === false) {
        throw new Error('Erreur lors de la récupération des boutiques');
      }

      const pageBoutiques = response.donnees || response.boutiques || [];
      allBoutiques.push(...pageBoutiques);

      totalPages =
        response.total_pages ||
        (response.total
          ? Math.ceil(response.total / BOUTIQUES_PAGE_SIZE)
          : pageBoutiques.length < BOUTIQUES_PAGE_SIZE
            ? page
            : page + 1);

      // Sécurité : arrêter si une page revient vide
      if (pageBoutiques.length === 0) {
        break;
      }

      page += 1;
    } while (page <= totalPages);

    return allBoutiques;
  } catch (error) {
    console.error('Erreur lors de la récupération des boutiques:', error);
    throw error;
  }
}

/**
 * Boutiques internes (tests) à exclure des listes publiques
 */
const INTERNAL_BOUTIQUE_IDS = new Set([1]);

/**
 * Récupère la liste de toutes les boutiques actives
 * @returns Promise<Boutique[]> - La liste des boutiques actives
 */
export async function getAllBoutiquesActives(): Promise<Boutique[]> {
  try {
    const boutiques = await getAllBoutiques();

    return boutiques.filter(
      (boutique) =>
        boutique.statut === 'active' && !INTERNAL_BOUTIQUE_IDS.has(boutique.id)
    );
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
