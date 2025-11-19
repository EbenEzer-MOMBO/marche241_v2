/**
 * Service pour la gestion du panier
 */

import api from '@/lib/api';
import { getOrCreateSessionId } from './session';

interface AjoutPanierRequest {
  session_id: string;
  boutique_id: number;
  produit_id: number;
  quantite: number;
  variants_selectionnes: { [key: string]: string };
}

interface AjoutPanierResponse {
  success: boolean;
  message: string;
  panier_item?: {
    id: number;
    session_id: string;
    boutique_id: number;
    produit_id: number;
    quantite: number;
    variants_selectionnes: { [key: string]: string };
    date_ajout: string;
  };
}

interface PanierItem {
  id: number;
  session_id: string;
  boutique_id: number;
  produit_id: number;
  quantite: number;
  variants_selectionnes: { [key: string]: any } | null;
  date_creation: string;
  date_modification: string;
  boutique: {
    id: number;
    nom: string;
    logo?: string;
    slug: string;
    statut: string;
    adresse?: string;
    telephone?: string;
    vendeur_id: number;
    description?: string;
    nombre_avis: number;
    note_moyenne: number;
    date_creation: string;
    nombre_produits: number;
    couleur_primaire?: string;
    date_modification: string;
    couleur_secondaire?: string;
  };
  produit: {
    id: number;
    nom: string;
    sku?: string;
    prix: number;
    slug: string;
    tags?: any;
    poids?: number;
    images?: any;
    statut: string;
    en_stock: boolean;
    variants?: { [key: string]: any };
    dimensions?: any;
    boutique_id: number;
    description?: string;
    est_nouveau: boolean;
    nombre_avis: number;
    nombre_vues: number;
    categorie_id: number;
    est_featured: boolean;
    note_moyenne: number;
    date_creation: string;
    nombre_ventes: number;
    prix_original?: number;
    quantite_stock: number;
    date_publication?: string;
    est_en_promotion: boolean;
    image_principale?: string;
    date_modification: string;
    description_courte?: string;
  };
}

interface ProduitSupprime {
  id: number;
  nom: string;
  raison: string;
  variants?: { [key: string]: any };
}

interface QuantiteAjustee {
  id: number;
  nom: string;
  quantiteOriginale: number;
  nouvelleQuantite: number;
  stockDisponible: number;
  variants?: { [key: string]: any };
}

interface Avertissements {
  produitsSupprimes?: ProduitSupprime[];
  quantitesAjustees?: QuantiteAjustee[];
}

interface PanierResponse {
  success: boolean;
  panier: PanierItem[];
  avertissements?: Avertissements;
}

/**
 * Ajoute un produit au panier
 * @param boutiqueId - L'ID de la boutique
 * @param produitId - L'ID du produit
 * @param quantite - La quantité à ajouter
 * @param variantsSelectionnes - Les variants sélectionnés
 * @returns Promise<AjoutPanierResponse> - Réponse de l'ajout au panier
 */
export async function ajouterAuPanier(
  boutiqueId: number,
  produitId: number,
  quantite: number,
  variantsSelectionnes: { [key: string]: string } = {}
): Promise<AjoutPanierResponse> {
  try {
    // Obtenir une session spécifique à cette boutique
    const sessionId = getOrCreateSessionId(boutiqueId);
    
    const requestData: AjoutPanierRequest = {
      session_id: sessionId,
      boutique_id: boutiqueId,
      produit_id: produitId,
      quantite,
      variants_selectionnes: variantsSelectionnes
    };

    const response = await api.post<AjoutPanierResponse>('/panier', requestData);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de l\'ajout au panier');
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    throw error;
  }
}

/**
 * Récupère le contenu du panier pour la session actuelle
 * @param boutiqueId - L'ID de la boutique (optionnel, pour isoler les paniers par boutique)
 * @returns Promise<PanierResponse> - Contenu du panier
 */
export async function getPanier(boutiqueId?: number): Promise<PanierResponse> {
  try {
    // Obtenir une session spécifique à cette boutique si fournie
    const sessionId = getOrCreateSessionId(boutiqueId);
    
    const response = await api.get<PanierResponse>(`/panier/${sessionId}`);
    
    if (!response.success) {
      throw new Error('Erreur lors de la récupération du panier');
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    throw error;
  }
}

/**
 * Met à jour la quantité d'un item du panier
 * @param itemId - L'ID de l'item dans le panier
 * @param quantite - La nouvelle quantité
 * @returns Promise<AjoutPanierResponse> - Réponse de la mise à jour
 */
export async function mettreAJourQuantitePanier(
  itemId: number,
  quantite: number
): Promise<AjoutPanierResponse> {
  try {
    const response = await api.patch<AjoutPanierResponse>(`/panier/${itemId}/quantite`, {
      quantite
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la mise à jour du panier');
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    throw error;
  }
}

/**
 * Supprime un item du panier
 * @param itemId - L'ID de l'item dans le panier
 * @returns Promise<{ success: boolean; message: string }> - Réponse de la suppression
 */
export async function supprimerDuPanier(itemId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/panier/${itemId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la suppression du panier');
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error);
    throw error;
  }
}

/**
 * Vide complètement le panier
 * @param boutiqueId - L'ID de la boutique (optionnel)
 * @returns Promise<{ success: boolean; message: string }> - Réponse du vidage
 */
export async function viderPanier(boutiqueId?: number): Promise<{ success: boolean; message: string }> {
  try {
    // Obtenir une session spécifique à cette boutique si fournie
    const sessionId = getOrCreateSessionId(boutiqueId);
    
    const response = await api.delete<{ success: boolean; message: string }>(`/panier?session_id=${sessionId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors du vidage du panier');
    }
    
    return response;
  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error);
    throw error;
  }
}

export default {
  ajouterAuPanier,
  getPanier,
  mettreAJourQuantitePanier,
  supprimerDuPanier,
  viderPanier
};
