/**
 * Service pour la gestion des communes (zones de livraison)
 */

import api from '@/lib/api';

// Interface pour les communes
export interface Commune {
  id: number;
  boutique_id: number;
  nom_commune: string;
  code_postal: string | null;
  tarif_livraison: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
  est_active: boolean;
  date_creation: string;
  date_modification: string;
}

// Interface pour créer une commune
export interface CreerCommuneData {
  boutique_id: number;
  nom_commune: string;
  code_postal?: string;
  tarif_livraison: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
}

// Interface pour modifier une commune
export interface ModifierCommuneData {
  nom_commune?: string;
  code_postal?: string | null;
  tarif_livraison?: number;
  delai_livraison_min?: number;
  delai_livraison_max?: number;
  est_active?: boolean;
}

// Interface pour la réponse de l'API
interface CommunesResponse {
  success: boolean;
  message?: string;
  communes: Commune[];
}

interface CommuneResponse {
  success: boolean;
  message?: string;
  commune: Commune;
}

/**
 * Récupère toutes les communes d'une boutique
 * @param boutiqueId - ID de la boutique
 * @returns Liste des communes
 */
export async function getCommunesParBoutique(boutiqueId: number): Promise<Commune[]> {
  try {
    const response = await api.get<CommunesResponse>(`/communes/boutique/${boutiqueId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la récupération des communes');
    }

    return response.communes || [];
  } catch (error: any) {
    console.error('Erreur lors de la récupération des communes:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des communes');
  }
}

/**
 * Récupère une commune par son ID
 * @param id - ID de la commune
 * @returns Détails de la commune
 */
export async function getCommuneById(id: number): Promise<Commune> {
  try {
    const response = await api.get<CommuneResponse>(`/communes/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la récupération de la commune');
    }

    return response.commune;
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la commune:', error);
    
    if (error.status === 404) {
      throw new Error('Commune non trouvée');
    }
    
    throw new Error(error.message || 'Erreur lors de la récupération de la commune');
  }
}

/**
 * Crée une nouvelle commune
 * @param data - Données de la commune à créer
 * @returns Commune créée
 */
export async function creerCommune(data: CreerCommuneData): Promise<Commune> {
  try {
    const response = await api.post<CommuneResponse>('/communes', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la création de la commune');
    }

    return response.commune;
  } catch (error: any) {
    console.error('Erreur lors de la création de la commune:', error);
    
    if (error.status === 400) {
      throw new Error(error.message || 'Données invalides');
    }
    
    if (error.status === 401) {
      throw new Error('Non autorisé. Veuillez vous reconnecter.');
    }
    
    if (error.status === 409) {
      throw new Error('Une commune avec ce nom existe déjà pour cette boutique');
    }
    
    throw new Error(error.message || 'Erreur lors de la création de la commune');
  }
}

/**
 * Modifie une commune existante
 * @param id - ID de la commune à modifier
 * @param data - Données à modifier
 * @returns Commune modifiée
 */
export async function modifierCommune(id: number, data: ModifierCommuneData): Promise<Commune> {
  try {
    const response = await api.put<CommuneResponse>(`/communes/${id}`, data);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la modification de la commune');
    }

    return response.commune;
  } catch (error: any) {
    console.error('Erreur lors de la modification de la commune:', error);
    
    if (error.status === 400) {
      throw new Error(error.message || 'Données invalides');
    }
    
    if (error.status === 401) {
      throw new Error('Non autorisé. Veuillez vous reconnecter.');
    }
    
    if (error.status === 404) {
      throw new Error('Commune non trouvée');
    }
    
    if (error.status === 409) {
      throw new Error('Une commune avec ce nom existe déjà pour cette boutique');
    }
    
    throw new Error(error.message || 'Erreur lors de la modification de la commune');
  }
}

/**
 * Supprime une commune
 * @param id - ID de la commune à supprimer
 */
export async function supprimerCommune(id: number): Promise<void> {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/communes/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Erreur lors de la suppression de la commune');
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la commune:', error);
    
    if (error.status === 401) {
      throw new Error('Non autorisé. Veuillez vous reconnecter.');
    }
    
    if (error.status === 404) {
      throw new Error('Commune non trouvée');
    }
    
    if (error.status === 409) {
      throw new Error('Impossible de supprimer cette commune car elle est utilisée par des commandes');
    }
    
    throw new Error(error.message || 'Erreur lors de la suppression de la commune');
  }
}

/**
 * Active ou désactive une commune
 * @param id - ID de la commune
 * @param est_active - Nouveau statut
 * @returns Commune mise à jour
 */
export async function toggleCommuneStatus(id: number, est_active: boolean): Promise<Commune> {
  return modifierCommune(id, { est_active });
}

/**
 * Récupère les communes actives d'une boutique (pour le frontend client)
 * @param boutiqueId - ID de la boutique
 * @returns Liste des communes actives
 */
export async function getCommunesActives(boutiqueId: number): Promise<Commune[]> {
  const communes = await getCommunesParBoutique(boutiqueId);
  return communes.filter(commune => commune.est_active);
}
