/**
 * Service pour la gestion des catégories
 */

import api from '@/lib/api';
import { ApiCategoriesResponse, Categorie } from '@/lib/database-types';

/**
 * Récupère toutes les catégories d'une boutique
 * @param boutiqueId - L'ID de la boutique
 * @returns Promise<Categorie[]> - Liste des catégories
 */
export async function getCategoriesParBoutique(boutiqueId: number): Promise<Categorie[]> {
  try {
    const response = await api.get<ApiCategoriesResponse>(`/categories?boutique_id=${boutiqueId}`);
    
    if (!response.success || !response.categories) {
      throw new Error('Erreur lors de la récupération des catégories');
    }
    
    return response.categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
}

/**
 * Récupère une catégorie par son ID
 * @param id - L'ID de la catégorie
 * @returns Promise<Categorie> - La catégorie
 */
export async function getCategorieById(id: number): Promise<Categorie> {
  try {
    const response = await api.get<{success: boolean; categorie: Categorie}>(`/categories/${id}`);
    
    if (!response.success || !response.categorie) {
      throw new Error(`Catégorie avec l'ID ${id} introuvable`);
    }
    
    return response.categorie;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
}

/**
 * Récupère une catégorie par son slug
 * @param slug - Le slug de la catégorie
 * @param boutiqueId - L'ID de la boutique (optionnel pour plus de spécificité)
 * @returns Promise<Categorie> - La catégorie
 */
export async function getCategorieBySlug(slug: string, boutiqueId?: number): Promise<Categorie> {
  try {
    const params = new URLSearchParams();
    if (boutiqueId) params.append('boutique_id', boutiqueId.toString());

    const url = `/categories/slug/${slug}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<{success: boolean; categorie: Categorie}>(url);
    
    if (!response.success || !response.categorie) {
      throw new Error(`Catégorie "${slug}" introuvable`);
    }
    
    return response.categorie;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
}

/**
 * Organise les catégories en hiérarchie (parent/enfant)
 * @param categories - Liste plate des catégories
 * @returns Categorie[] - Catégories organisées en hiérarchie
 */
export function organiserCategoriesHierarchie(categories: Categorie[]): Categorie[] {
  const categoriesMap = new Map<number, Categorie>();
  const categoriesAvecEnfants = categories.map(cat => ({ ...cat, enfants: [] as Categorie[] }));
  
  // Créer une map pour un accès rapide
  categoriesAvecEnfants.forEach(cat => {
    categoriesMap.set(cat.id, cat);
  });
  
  // Organiser la hiérarchie
  const categoriesRacines: Categorie[] = [];
  
  categoriesAvecEnfants.forEach(categorie => {
    if (categorie.parent_id) {
      // C'est une catégorie enfant
      const parent = categoriesMap.get(categorie.parent_id);
      if (parent && parent.enfants) {
        parent.enfants.push(categorie);
      }
    } else {
      // C'est une catégorie racine
      categoriesRacines.push(categorie);
    }
  });
  
  // Trier par ordre d'affichage
  const trierParOrdre = (cats: Categorie[]) => {
    cats.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
    cats.forEach(cat => {
      if (cat.enfants && cat.enfants.length > 0) {
        trierParOrdre(cat.enfants);
      }
    });
  };
  
  trierParOrdre(categoriesRacines);
  
  return categoriesRacines;
}

/**
 * Filtre les catégories actives
 * @param categories - Liste des catégories
 * @returns Categorie[] - Catégories actives uniquement
 */
export function filtrerCategoriesActives(categories: Categorie[]): Categorie[] {
  return categories.filter(cat => cat.statut === 'active');
}

/**
 * Crée une nouvelle catégorie
 * @param categorieData - Données de la catégorie à créer
 * @returns Promise<Categorie> - La catégorie créée
 */
export async function creerCategorie(categorieData: {
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre_affichage: number;
  boutique_id: number;
}): Promise<Categorie> {
  try {
    const response = await api.post<{success: boolean; message: string; categorie: Categorie}>('/categories', categorieData);
    
    if (!response.success || !response.categorie) {
      throw new Error(response.message || 'Erreur lors de la création de la catégorie');
    }
    
    return response.categorie;
  } catch (error: any) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    if (error.status === 400) {
      throw new Error('Données invalides');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 409) {
      throw new Error('Ce slug est déjà utilisé');
    }
    
    throw error;
  }
}

/**
 * Met à jour une catégorie existante
 * @param id - ID de la catégorie
 * @param categorieData - Nouvelles données de la catégorie
 * @returns Promise<Categorie> - La catégorie mise à jour
 */
export async function modifierCategorie(id: number, categorieData: {
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre_affichage: number;
}): Promise<Categorie> {
  try {
    const response = await api.put<{success: boolean; message: string; categorie: Categorie}>(`/categories/${id}`, categorieData);
    
    if (!response.success || !response.categorie) {
      throw new Error(response.message || 'Erreur lors de la modification de la catégorie');
    }
    
    return response.categorie;
  } catch (error: any) {
    console.error('Erreur lors de la modification de la catégorie:', error);
    
    if (error.status === 400) {
      throw new Error('Données invalides');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 403) {
      throw new Error('Non autorisé (pas le propriétaire)');
    } else if (error.status === 404) {
      throw new Error('Catégorie non trouvée');
    } else if (error.status === 409) {
      throw new Error('Ce slug est déjà utilisé');
    }
    
    throw error;
  }
}

/**
 * Supprime une catégorie
 * @param id - ID de la catégorie à supprimer
 * @returns Promise<void>
 */
export async function supprimerCategorie(id: number): Promise<void> {
  try {
    const response = await api.delete<{success: boolean; message: string}>(`/categories/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la suppression de la catégorie');
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    
    if (error.status === 400) {
      throw new Error('Impossible de supprimer (sous-catégories ou produits associés)');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 403) {
      throw new Error('Non autorisé (pas le propriétaire)');
    } else if (error.status === 404) {
      throw new Error('Catégorie non trouvée');
    }
    
    throw error;
  }
}

/**
 * Utilitaire pour obtenir l'icône d'une catégorie basée sur son nom
 * @param nomCategorie - Nom de la catégorie
 * @returns string - Emoji ou icône
 */
export function getIconeCategorie(nomCategorie: string): string {
  const nom = nomCategorie.toLowerCase();
  
  if (nom.includes('mode') || nom.includes('vêtement') || nom.includes('fashion')) return '👕';
  if (nom.includes('électronique') || nom.includes('tech') || nom.includes('smartphone')) return '📱';
  if (nom.includes('maison') || nom.includes('déco') || nom.includes('home')) return '🏠';
  if (nom.includes('accessoire') || nom.includes('bijou')) return '💎';
  if (nom.includes('sport') || nom.includes('fitness')) return '⚽';
  if (nom.includes('beauté') || nom.includes('cosmétique')) return '💄';
  if (nom.includes('livre') || nom.includes('lecture')) return '📚';
  if (nom.includes('auto') || nom.includes('voiture')) return '🚗';
  if (nom.includes('enfant') || nom.includes('bébé') || nom.includes('jouet')) return '🧸';
  if (nom.includes('alimentaire') || nom.includes('nourriture') || nom.includes('food')) return '🍎';
  
  // Icône par défaut
  return '📦';
}

export default {
  getCategoriesParBoutique,
  getCategorieById,
  getCategorieBySlug,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
  organiserCategoriesHierarchie,
  filtrerCategoriesActives,
  getIconeCategorie
};
