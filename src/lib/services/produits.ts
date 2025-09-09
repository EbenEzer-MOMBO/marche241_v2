/**
 * Service pour la gestion des produits
 */

import api from '@/lib/api';
import { 
  ApiProduitsResponse, 
  ApiProduitResponse,
  ApiCategoriesProduitsResponse,
  ProduitDB,
  CategorieAvecProduits,
  ProduitAffichage
} from '@/lib/database-types';

/**
 * Récupère les produits par catégorie pour une boutique
 * @param boutiqueId - L'ID de la boutique
 * @returns Promise<{[slug: string]: CategorieAvecProduits}> - Produits groupés par catégorie
 */
export async function getProduitsParCategorie(boutiqueId: number): Promise<{[slug: string]: CategorieAvecProduits}> {
  try {
    const response = await api.get<ApiCategoriesProduitsResponse>(`/produits/categories?boutique_id=${boutiqueId}`);
    
    if (!response.success || !response.categories) {
      throw new Error('Erreur lors de la récupération des produits par catégorie');
    }
    
    return response.categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    throw error;
  }
}

/**
 * Récupère tous les produits d'une boutique
 * @param boutiqueId - L'ID de la boutique
 * @param options - Options de pagination et filtres
 * @returns Promise<ProduitDB[]> - Liste des produits
 */
export async function getProduitsParBoutique(
  boutiqueId: number,
  options?: {
    page?: number;
    limite?: number;
    categorie_id?: number;
    featured?: boolean;
    nouveaux?: boolean;
    promotion?: boolean;
  }
): Promise<{ produits: ProduitDB[]; total?: number; page?: number; limite?: number }> {
  try {
    const params = new URLSearchParams();
    params.append('boutique_id', boutiqueId.toString());
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limite) params.append('limite', options.limite.toString());
    if (options?.categorie_id) params.append('categorie_id', options.categorie_id.toString());
    if (options?.featured) params.append('featured', 'true');
    if (options?.nouveaux) params.append('nouveaux', 'true');
    if (options?.promotion) params.append('promotion', 'true');

    const response = await api.get<ApiProduitsResponse>(`/produits?${params.toString()}`);
    
    if (!response.success || !response.produits) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    return {
      produits: response.produits,
      total: response.total,
      page: response.page,
      limite: response.limite
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
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
    const response = await api.get<ApiProduitResponse>(`/produits/${id}`);
    
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
 * Récupère un produit par son slug
 * @param slug - Le slug du produit
 * @param boutiqueId - L'ID de la boutique (optionnel pour plus de spécificité)
 * @returns Promise<ProduitDB> - Le produit
 */
export async function getProduitBySlug(slug: string, boutiqueId?: number): Promise<ProduitDB> {
  try {
    const params = new URLSearchParams();
    if (boutiqueId) params.append('boutique_id', boutiqueId.toString());

    const url = `/produits/slug/${slug}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<ApiProduitResponse>(url);
    
    if (!response.success || !response.produit) {
      throw new Error(`Produit "${slug}" introuvable`);
    }
    
    return response.produit;
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    throw error;
  }
}

/**
 * Convertit un ProduitDB en ProduitAffichage pour l'interface
 * @param produit - Le produit de la base de données
 * @returns ProduitAffichage - Le produit formaté pour l'affichage
 */
export function formatProduitPourAffichage(produit: ProduitDB): ProduitAffichage {
  return {
    id: produit.id,
    nom: produit.nom,
    slug: produit.slug,
    prix: produit.prix,
    prix_original: produit.prix_original || undefined,
    image_principale: produit.image_principale || undefined,
    est_nouveau: produit.est_nouveau,
    est_en_promotion: produit.est_en_promotion,
    est_featured: produit.est_featured,
    en_stock: produit.en_stock,
    note_moyenne: produit.note_moyenne,
    nombre_avis: produit.nombre_avis,
    boutique: {
      id: produit.boutique?.id || 0,
      nom: produit.boutique?.nom || '',
      logo: produit.boutique?.logo || undefined,
      slug: produit.boutique?.slug || ''
    },
    categorie: {
      id: produit.categorie?.id || 0,
      nom: produit.categorie?.nom || '',
      slug: produit.categorie?.slug || ''
    }
  };
}

/**
 * Utilitaire pour obtenir l'URL de l'image d'un produit avec fallback
 * @param imageUrl - URL de l'image du produit
 * @returns string - URL de l'image ou image par défaut
 */
export function getProduitImageUrl(imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim() !== '') {
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      console.warn('URL d\'image de produit invalide:', imageUrl);
    }
  }
  return '/article1.webp'; // Image par défaut pour les produits
}

/**
 * Formatage du prix en FCFA
 * @param prix - Prix en centimes
 * @returns string - Prix formaté
 */
export function formatPrix(prix: number): string {
  return `${prix.toLocaleString()} FCFA`;
}

export default {
  getProduitsParCategorie,
  getProduitsParBoutique,
  getProduitById,
  getProduitBySlug,
  formatProduitPourAffichage,
  getProduitImageUrl,
  formatPrix
};
