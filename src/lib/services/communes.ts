/**
 * Service pour la gestion des communes
 */

import api from '@/lib/api';

interface Commune {
  id: number;
  boutique_id: number;
  nom_commune: string;
  code_postal?: string | null;
  tarif_livraison: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
  est_active: boolean;
  date_creation: string;
  date_modification: string;
}

interface CommunesResponse {
  success: boolean;
  communes: Commune[];
}

/**
 * Récupère les communes actives d'une boutique
 * @param boutiqueId - L'ID de la boutique
 * @returns Promise<Commune[]> - Liste des communes actives
 */
export async function getCommunesActives(boutiqueId: number): Promise<Commune[]> {
  try {
    const response = await api.get<CommunesResponse>(`/communes/boutique/${boutiqueId}/actives`);
    
    if (!response.success || !response.communes) {
      throw new Error('Erreur lors de la récupération des communes');
    }
    
    return response.communes;
  } catch (error) {
    console.error('Erreur lors de la récupération des communes:', error);
    throw error;
  }
}

export default {
  getCommunesActives
};
