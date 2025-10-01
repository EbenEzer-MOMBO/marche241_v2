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
  ProduitAffichage,
  ProduitDetail
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
    prix_original: produit.prix_original || produit.prix_promo,
    image_principale: produit.image_principale,
    est_nouveau: produit.est_nouveau || false,
    est_en_promotion: produit.est_en_promotion || false,
    est_featured: produit.est_featured || false,
    en_stock: produit.en_stock,
    note_moyenne: produit.note_moyenne || 0,
    nombre_avis: produit.nombre_avis || 0,
    boutique: {
      id: produit.boutique?.id || 0,
      nom: produit.boutique?.nom || '',
      logo: produit.boutique?.logo,
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
  return '/default-product.png'; // Image par défaut pour les produits
}

/**
 * Convertit une réponse API de produit en ProduitDetail pour l'affichage détaillé
 * @param apiResponse - Réponse de l'API avec la structure complète
 * @returns ProduitDetail - Le produit formaté pour l'affichage détaillé
 */
export function formatApiProduitPourDetail(apiResponse: { success: boolean; produit: any }): ProduitDetail | null {
  if (!apiResponse.success || !apiResponse.produit) {
    return null;
  }

  const produit = apiResponse.produit;
  
  // Traitement des images - convertir en tableau
  let images: string[] = [];
  if (produit.images) {
    if (Array.isArray(produit.images)) {
      images = produit.images.filter((img: string) => img && img.trim() !== '');
    } else if (typeof produit.images === 'string') {
      try {
        const parsedImages = JSON.parse(produit.images);
        images = Array.isArray(parsedImages) ? parsedImages.filter((img: string) => img && img.trim() !== '') : [];
      } catch {
        images = [];
      }
    }
  }
  
  // Si pas d'images et qu'il y a une image principale, l'ajouter
  if (images.length === 0 && produit.image_principale) {
    images = [produit.image_principale];
  }
  
  // Si toujours pas d'images, utiliser l'image par défaut
  if (images.length === 0) {
    images = ['/default-product.png'];
  }

  // Traitement des variantes
  let variants: { [key: string]: any } = {};
  if (produit.variants) {
    if (typeof produit.variants === 'object') {
      variants = produit.variants;
    } else if (typeof produit.variants === 'string') {
      try {
        variants = JSON.parse(produit.variants);
      } catch {
        variants = {};
      }
    }
  }

  // Traitement des tags
  let tags: string[] = [];
  if (produit.tags) {
    if (Array.isArray(produit.tags)) {
      tags = produit.tags;
    } else if (typeof produit.tags === 'string') {
      try {
        const parsedTags = JSON.parse(produit.tags);
        tags = Array.isArray(parsedTags) ? parsedTags : [];
      } catch {
        tags = [];
      }
    }
  }

  // Traitement des dimensions
  let dimensions: { [key: string]: any } = {};
  if (produit.dimensions) {
    if (typeof produit.dimensions === 'object') {
      dimensions = produit.dimensions;
    } else if (typeof produit.dimensions === 'string') {
      try {
        dimensions = JSON.parse(produit.dimensions);
      } catch {
        dimensions = {};
      }
    }
  }

  return {
    id: produit.id,
    nom: produit.nom,
    slug: produit.slug,
    description: produit.description,
    description_courte: produit.description_courte,
    prix: produit.prix,
    prix_original: produit.prix_original,
    sku: produit.sku,
    images,
    image_principale: produit.image_principale || images[0],
    variants,
    en_stock: produit.en_stock,
    quantite_stock: produit.quantite_stock,
    poids: produit.poids,
    dimensions,
    tags,
    note_moyenne: produit.note_moyenne,
    nombre_avis: produit.nombre_avis,
    nombre_vues: produit.nombre_vues,
    nombre_ventes: produit.nombre_ventes,
    est_nouveau: produit.est_nouveau,
    est_en_promotion: produit.est_en_promotion,
    est_featured: produit.est_featured,
    statut: produit.statut,
    date_creation: produit.date_creation,
    date_modification: produit.date_modification,
    date_publication: produit.date_publication,
    boutique: {
      id: produit.boutique?.id || 0,
      nom: produit.boutique?.nom || '',
      logo: produit.boutique?.logo,
      slug: produit.boutique?.slug || '',
      statut: produit.boutique?.statut || 'active',
      adresse: produit.boutique?.adresse,
      telephone: produit.boutique?.telephone,
      vendeur_id: produit.boutique?.vendeur_id || 0,
      description: produit.boutique?.description,
      nombre_avis: produit.boutique?.nombre_avis || 0,
      note_moyenne: produit.boutique?.note_moyenne || 0,
      date_creation: produit.boutique?.date_creation || '',
      nombre_produits: produit.boutique?.nombre_produits || 0,
      couleur_primaire: produit.boutique?.couleur_primaire,
      couleur_secondaire: produit.boutique?.couleur_secondaire,
      date_modification: produit.boutique?.date_modification || ''
    },
    categorie: {
      id: produit.categorie?.id || 0,
      nom: produit.categorie?.nom || '',
      slug: produit.categorie?.slug || '',
      statut: produit.categorie?.statut || 'active',
      parent_id: produit.categorie?.parent_id,
      boutique_id: produit.categorie?.boutique_id || 0,
      description: produit.categorie?.description,
      date_creation: produit.categorie?.date_creation || '',
      ordre_affichage: produit.categorie?.ordre_affichage || 0,
      date_modification: produit.categorie?.date_modification || ''
    }
  };
}

/**
 * Convertit les variantes d'un produit au format attendu par ProductDetail
 * @param variants - Variantes du produit (objet JSON)
 * @returns Tableau de variantes formatées pour l'interface
 */
export function formatVariantsPourInterface(variants: { [key: string]: any }): { label: string; options: string[] }[] {
  if (!variants || typeof variants !== 'object') {
    return [];
  }

  return Object.entries(variants).map(([key, value]) => {
    let options: string[] = [];
    
    if (typeof value === 'string') {
      options = [value];
    } else if (Array.isArray(value)) {
      options = value.filter(v => typeof v === 'string' && v.trim() !== '');
    } else if (typeof value === 'object' && value !== null) {
      // Si c'est un objet, essayer d'extraire les valeurs
      options = Object.values(value).filter(v => typeof v === 'string' && v.trim() !== '') as string[];
    }

    return {
      label: key.charAt(0).toUpperCase() + key.slice(1), // Capitaliser la première lettre
      options
    };
  }).filter(variant => variant.options.length > 0);
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
  formatApiProduitPourDetail,
  formatVariantsPourInterface,
  getProduitImageUrl,
  formatPrix
};
