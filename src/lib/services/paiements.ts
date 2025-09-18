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
  bill_id?: string;
  transaction_id?: string;
  status?: string;
  message?: string;
}

interface VerificationPaiementResponse {
  success: boolean;
  status: 'en_attente' | 'paye' | 'echec' | 'rembourse';
  message?: string;
  transaction_id?: string;
  amount?: number;
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
    console.error('Erreur lors de l\'initiation du paiement:', error);
    throw new Error('Impossible d\'initier le paiement. Veuillez réessayer.');
  }
}

/**
 * Vérifier le statut d'un paiement mobile
 * @param billId - ID de la facture à vérifier
 * @returns Promise<VerificationPaiementResponse>
 */
export async function verifierPaiement(billId: string): Promise<VerificationPaiementResponse> {
  try {
    const response = await api.get<VerificationPaiementResponse>(`/paiements/verification/${billId}`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    throw new Error('Impossible de vérifier le paiement. Veuillez réessayer.');
  }
}

/**
 * Vérifier le paiement en boucle pendant une durée donnée
 * @param billId - ID de la facture à vérifier
 * @param durationMs - Durée en millisecondes (défaut: 60000 = 1 minute)
 * @param intervalMs - Intervalle entre les vérifications (défaut: 5000 = 5 secondes)
 * @returns Promise<VerificationPaiementResponse>
 */
export async function verifierPaiementEnBoucle(
  billId: string, 
  durationMs: number = 60000, 
  intervalMs: number = 5000
): Promise<VerificationPaiementResponse> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkPayment = async () => {
      try {
        const result = await verifierPaiement(billId);
        
        // Si le paiement est terminé (succès ou échec), on arrête
        if (result.status === 'paye' || result.status === 'echec' || result.status === 'rembourse') {
          resolve(result);
          return;
        }
        
        // Si on a dépassé la durée limite, on arrête
        if (Date.now() - startTime >= durationMs) {
          resolve(result); // Retourner le dernier statut
          return;
        }
        
        // Programmer la prochaine vérification
        setTimeout(checkPayment, intervalMs);
        
      } catch (error) {
        reject(error);
      }
    };
    
    // Démarrer la première vérification
    checkPayment();
  });
}

export type { PaiementMobileData, PaiementMobileResponse, VerificationPaiementResponse };
