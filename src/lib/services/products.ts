/**
 * Service pour la gestion des produits
 */

import api, { ApiError } from '@/lib/api';
import { ProduitDB } from '@/lib/database-types';
import {
  ProductValidationError,
  type ProductValidationErrorItem,
} from '@/lib/errors/product-validation-error';

/** Réponse POST/PUT produit : succès ou échec (validation incluse) */
type ProduitMutationResponse =
  | { success: true; message?: string; produit: ProduitDB | string }
  | {
      success: false;
      code?: string;
      message: string;
      errors?: ProductValidationErrorItem[];
      stack?: string;
    };

type ProduitMutationContext = 'create' | 'update';

/**
 * Transforme une erreur HTTP API (400 avec corps validation) en ProductValidationError.
 */
const rethrowAsProduitError = (
  error: unknown,
  ctx: ProduitMutationContext
): never => {
  if (error instanceof ProductValidationError) {
    throw error;
  }

  if (error instanceof ApiError) {
    const data = error.response as
      | {
          code?: string;
          message?: string;
          errors?: ProductValidationErrorItem[];
        }
      | undefined;

    if (
      data &&
      (data.code === 'VALIDATION_ERROR' ||
        (Array.isArray(data.errors) && data.errors.length > 0))
    ) {
      const msg =
        typeof data.message === 'string' && data.message.trim()
          ? data.message
          : error.message;
      throw new ProductValidationError(msg, {
        code:
          typeof data.code === 'string' ? data.code : 'VALIDATION_ERROR',
        errors: data.errors,
      });
    }

    if (error.status === 400) {
      throw new Error(error.message || 'Données invalides');
    }
    if (error.status === 401) {
      throw new Error('Non authentifié');
    }
    if (error.status === 403) {
      throw new Error(
        ctx === 'update'
          ? 'Non autorisé (pas le propriétaire)'
          : 'Non autorisé (pas propriétaire de la boutique)'
      );
    }
    if (error.status === 404) {
      throw new Error('Produit non trouvé');
    }
    if (error.status === 409) {
      throw new Error('Conflit (slug déjà utilisé)');
    }
    if (error.status === 500) {
      throw new Error('Erreur serveur');
    }

    throw new Error(error.message || 'Erreur lors de la requête');
  }

  throw error;
};

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
 * Inclut le contrat de recherche avancée (MAR-9).
 */
export interface ProduitsParams {
  page?: number;
  limite?: number;
  tri_par?: string;
  ordre?: 'ASC' | 'DESC';
  q?: string;
  prix_min?: number;
  prix_max?: number;
  commune_id?: number;
  categorie_id?: number;
  boutique_id?: number;
  featured?: boolean;
  nouveaux?: boolean;
  promotion?: boolean;
  en_stock?: boolean;
}

const appendProduitsQueryParams = (
  queryParams: URLSearchParams,
  params: ProduitsParams
): void => {
  const {
    page = 1,
    limite = 10,
    tri_par = 'date_creation',
    ordre = 'DESC',
    q,
    prix_min,
    prix_max,
    commune_id,
    categorie_id,
    boutique_id,
    featured,
    nouveaux,
    promotion,
    en_stock,
  } = params;

  queryParams.set('page', page.toString());
  queryParams.set('limite', limite.toString());
  queryParams.set('tri_par', tri_par);
  queryParams.set('ordre', ordre);

  if (q?.trim()) queryParams.set('q', q.trim());
  if (prix_min != null) queryParams.set('prix_min', String(prix_min));
  if (prix_max != null) queryParams.set('prix_max', String(prix_max));
  if (commune_id != null) queryParams.set('commune_id', String(commune_id));
  if (categorie_id != null) queryParams.set('categorie_id', String(categorie_id));
  if (boutique_id != null) queryParams.set('boutique_id', String(boutique_id));
  if (featured) queryParams.set('featured', 'true');
  if (nouveaux) queryParams.set('nouveaux', 'true');
  if (promotion) queryParams.set('promotion', 'true');
  if (en_stock === true) queryParams.set('en_stock', 'true');
  if (en_stock === false) queryParams.set('en_stock', 'false');
};

/**
 * Listing marketplace (toutes boutiques) — GET /produits
 */
export async function getProduits(
  params: ProduitsParams = {}
): Promise<ProduitsResponse> {
  try {
    const queryParams = new URLSearchParams();
    appendProduitsQueryParams(queryParams, params);

    const response = await api.get<ProduitsResponse>(
      `/produits?${queryParams.toString()}`
    );

    if (!response.success) {
      throw new Error('Erreur lors de la récupération des produits');
    }

    return response;
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des produits marketplace:', error);
    throw error;
  }
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
    const queryParams = new URLSearchParams();
    appendProduitsQueryParams(queryParams, params);

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
    const response = await api.get<{success: boolean; produit: ProduitDB}>(
      `/produits/${id}`,
      { headers: { 'x-skip-view-tracking': '1' } }
    );
    
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
  prix_original?: number;
  en_stock: number;
  boutique_id: number;
  categorie_id: number;
  images?: string[];
  image_principale?: string;
  variants?: any;
  statut: 'actif' | 'inactif' | 'brouillon';
}): Promise<ProduitDB> {
  try {
    const response = await api.post<ProduitMutationResponse>(
      '/produits',
      produitData
    );

    if (!response.success) {
      throw new ProductValidationError(
        response.message || 'Erreur lors de la création du produit',
        {
          code: response.code,
          errors: response.errors,
        }
      );
    }

    return typeof response.produit === 'string'
      ? JSON.parse(response.produit)
      : response.produit;
  } catch (error: unknown) {
    console.error('Erreur lors de la création du produit:', error);
    return rethrowAsProduitError(error, 'create');
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
  prix_promo?: number | null;
  en_stock?: number;
  categorie_id?: number;
  images?: string[];
  image_principale?: string;
  variants?: any;
  statut?: 'actif' | 'inactif' | 'brouillon';
}): Promise<ProduitDB> {
  try {
    const response = await api.put<ProduitMutationResponse>(
      `/produits/${id}`,
      produitData
    );

    if (!response.success) {
      throw new ProductValidationError(
        response.message || 'Erreur lors de la modification du produit',
        {
          code: response.code,
          errors: response.errors,
        }
      );
    }

    return typeof response.produit === 'string'
      ? JSON.parse(response.produit)
      : response.produit;
  } catch (error: unknown) {
    console.error('Erreur lors de la modification du produit:', error);
    return rethrowAsProduitError(error, 'update');
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
  getProduits,
  getProduitsParBoutique,
  getProduitById,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  uploadImageProduit,
  genererSlugProduit
};
