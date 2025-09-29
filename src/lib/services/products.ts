/**
 * Service pour la gestion des produits
 */

import api from '@/lib/api';
import { ProduitDB } from '@/lib/database-types';

/**
 * Interface pour la réponse paginée des produits
 */
export interface ProduitsResponse {
  success: boolean;
  donnees: ProduitDB[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}

/**
 * Paramètres pour la récupération des produits
 */
export interface ProduitsParams {
  page?: number;
  limite?: number;
  tri_par?: string;
  ordre?: 'ASC' | 'DESC';
}

/**
 * Récupère tous les produits d'une boutique avec pagination
 * @param boutiqueId - L'ID de la boutique
 * @param params - Paramètres de pagination et tri
 * @returns Promise<ProduitsResponse> - Réponse paginée avec les produits
 */
export async function getProduitsParBoutique(
  boutiqueId: number, 
  params: ProduitsParams = {}
): Promise<ProduitsResponse> {
  try {
    const {
      page = 1,
      limite = 10,
      tri_par = 'date_creation',
      ordre = 'DESC'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limite: limite.toString(),
      tri_par,
      ordre
    });

    const response = await api.get<ProduitsResponse>(
      `/produits/boutique/${boutiqueId}?${queryParams.toString()}`
    );
    
    if (!response.success) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des produits:', error);
    
    if (error.status === 400) {
      throw new Error('ID de boutique invalide');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur');
    }
    
    throw error;
  }
}

/**
 * Récupère un produit par son ID
 * @param id - L'ID du produit
 * @returns Promise<ProduitDB> - Le produit
 */
export async function getProduitById(id: number): Promise<ProduitDB> {
  try {
    const response = await api.get<{success: boolean; produit: ProduitDB}>(`/produits/${id}`);
    
    if (!response.success || !response.produit) {
      throw new Error(`Produit avec l'ID ${id} introuvable`);
    }
    
    return response.produit;
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    throw error;
  }
}

/**
 * Crée un nouveau produit
 * @param produitData - Données du produit à créer
 * @returns Promise<ProduitDB> - Le produit créé
 */
export async function creerProduit(produitData: {
  nom: string;
  slug: string;
  description?: string;
  prix: number;
  prix_promo?: number;
  stock: number;
  boutique_id: number;
  categorie_id: number;
  images?: string[];
  statut: 'actif' | 'inactif' | 'brouillon';
}): Promise<ProduitDB> {
  try {
    const response = await api.post<{success: boolean; message: string; produit: string}>('/produits', produitData);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la création du produit');
    }
    
    // Retourner les données du produit créé
    return JSON.parse(response.produit);
  } catch (error: any) {
    console.error('Erreur lors de la création du produit:', error);
    
    if (error.status === 400) {
      throw new Error('Données invalides');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 403) {
      throw new Error('Non autorisé (pas propriétaire de la boutique)');
    } else if (error.status === 409) {
      throw new Error('Conflit (slug déjà utilisé)');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur');
    }
    
    throw error;
  }
}

/**
 * Met à jour un produit existant
 * @param id - ID du produit
 * @param produitData - Nouvelles données du produit
 * @returns Promise<ProduitDB> - Le produit mis à jour
 */
export async function modifierProduit(id: number, produitData: {
  nom?: string;
  slug?: string;
  description?: string;
  prix?: number;
  prix_promo?: number;
  stock?: number;
  categorie_id?: number;
  images?: string[];
  statut?: 'actif' | 'inactif' | 'brouillon';
}): Promise<ProduitDB> {
  try {
    const response = await api.put<{success: boolean; message: string; produit: string}>(`/produits/${id}`, produitData);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la modification du produit');
    }
    
    // Retourner les données du produit mis à jour
    return JSON.parse(response.produit);
  } catch (error: any) {
    console.error('Erreur lors de la modification du produit:', error);
    
    if (error.status === 400) {
      throw new Error('Données invalides');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 403) {
      throw new Error('Non autorisé (pas le propriétaire)');
    } else if (error.status === 404) {
      throw new Error('Produit non trouvé');
    } else if (error.status === 409) {
      throw new Error('Conflit (slug déjà utilisé)');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur');
    }
    
    throw error;
  }
}

/**
 * Supprime un produit
 * @param id - ID du produit à supprimer
 * @returns Promise<void>
 */
export async function supprimerProduit(id: number): Promise<void> {
  try {
    const response = await api.delete<{success: boolean; message: string}>(`/produits/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la suppression du produit');
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression du produit:', error);
    
    if (error.status === 400) {
      throw new Error('Impossible de supprimer (commandes associées)');
    } else if (error.status === 401) {
      throw new Error('Non authentifié');
    } else if (error.status === 403) {
      throw new Error('Non autorisé (pas le propriétaire)');
    } else if (error.status === 404) {
      throw new Error('Produit non trouvé');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur');
    }
    
    throw error;
  }
}

/**
 * Upload d'image pour un produit
 * @param file - Fichier image à uploader
 * @returns Promise<string> - URL de l'image uploadée
 */
export async function uploadImageProduit(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<{success: boolean; url: string}>('/upload/produit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.success || !response.url) {
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
    
    return response.url;
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    
    if (error.status === 400) {
      throw new Error('Format d\'image non supporté');
    } else if (error.status === 413) {
      throw new Error('Image trop volumineuse');
    }
    
    throw error;
  }
}

/**
 * Génère un slug à partir du nom du produit
 * @param nom - Nom du produit
 * @returns string - Slug généré
 */
export function genererSlugProduit(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default {
  getProduitsParBoutique,
  getProduitById,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  uploadImageProduit,
  genererSlugProduit
};
