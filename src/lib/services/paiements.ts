/**
 * Service pour la gestion des paiements mobiles
 */

import api from '@/lib/api';

interface PaiementMobileData {
  email: string;
  msisdn: string;
  amount: number;
  reference: string;
  payment_system: 'airtelmoney' | 'moovmoney';
  description: string;
  lastname: string;
  firstname: string;
}

interface PaiementMobileResponse {
  success: boolean;
  transaction_id?: string;
  status?: string;
  message?: string;
  payment_url?: string;
  // Autres champs selon la réponse de l'API
}

/**
 * Initier un paiement mobile
 * @param paiementData - Données du paiement à initier
 * @returns Promise<PaiementMobileResponse>
 */
export async function initierPaiementMobile(paiementData: PaiementMobileData): Promise<PaiementMobileResponse> {
  try {
    const response = await api.post<PaiementMobileResponse>('/paiements/mobile', paiementData);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement mobile:', error);
    throw new Error('Impossible d\'initier le paiement. Veuillez réessayer.');
  }
}

export type { PaiementMobileData, PaiementMobileResponse };
