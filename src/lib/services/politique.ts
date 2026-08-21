/**
 * Service pour la politique de confidentialité
 */

import api from '@/lib/api';

export interface PolitiqueConfidentialite {
  id: number;
  contenu: string;
  date_creation?: string;
  date_modification?: string;
}

interface PolitiqueResponse {
  success: boolean;
  politique: PolitiqueConfidentialite;
  message?: string;
}

/**
 * Récupère la politique de confidentialité publique
 */
export async function getPolitiqueConfidentialite(): Promise<PolitiqueConfidentialite | null> {
  try {
    const response = await api.get<PolitiqueResponse>('/politique-confidentialite');

    if (!response.success || !response.politique) {
      return null;
    }

    return response.politique;
  } catch (error) {
    console.error('Erreur lors de la récupération de la politique:', error);
    return null;
  }
}
