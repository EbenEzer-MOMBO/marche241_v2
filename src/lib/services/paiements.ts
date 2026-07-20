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
  status: 'en_attente' | 'paye' | 'paid' | 'processed' | 'echec' | 'failed' | 'rembourse' | 'refunded' | 'pending' | 'ready';
  message?: string;
  transaction_id?: string;
  amount?: number;
}

/**
 * Initier un paiement mobile (le webhook Make.com est envoyé côté API serveur)
 */
export async function initierPaiementMobile(
  paiementData: PaiementMobileData
): Promise<PaiementMobileResponse> {
  try {
    return await api.post<PaiementMobileResponse>('/paiements/mobile', paiementData);
  } catch (error) {
    console.error('Erreur lors de l\'initiation du paiement:', error);
    throw new Error('Impossible d\'initier le paiement. Veuillez réessayer.');
  }
}

/**
 * Vérifier le statut d'un paiement mobile
 */
export async function verifierPaiement(billId: string): Promise<VerificationPaiementResponse> {
  try {
    const response = await api.get<any>(`/paiements/verification/${billId}`);
    
    let status: string | undefined;
    
    if (response.transaction?.statut) {
      status = response.transaction.statut;
    } else if (response.state) {
      status = response.state;
    } else if (response.status) {
      status = response.status;
    }
    
    return {
      success: response.success || false,
      status: status as any,
      message: response.message,
      transaction_id: response.transaction?.id?.toString(),
      amount: response.transaction?.montant
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    throw new Error('Impossible de vérifier le paiement. Veuillez réessayer.');
  }
}

/**
 * Vérifier le paiement en boucle pendant une durée donnée
 */
export async function verifierPaiementEnBoucle(
  billId: string, 
  durationMs: number = 60000, 
  intervalMs: number = 5000,
  cancelSignal?: { cancelled: boolean }
): Promise<VerificationPaiementResponse> {
  const startTime = Date.now();
  let timeoutId: NodeJS.Timeout | null = null;
  
  return new Promise((resolve, reject) => {
    const checkPayment = async () => {
      if (cancelSignal?.cancelled) {
        console.log('🛑 Vérification annulée par l\'utilisateur');
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('Vérification annulée par l\'utilisateur'));
        return;
      }

      try {
        const result = await verifierPaiement(billId);
        
        console.log('🔍 Vérification paiement:', { billId, status: result.status, result });
        
        if (!result.success || !result.status) {
          console.warn('⚠️ Réponse invalide ou erreur backend:', result);
          
          if (Date.now() - startTime >= durationMs) {
            console.log('⏱️ Timeout de vérification atteint avec erreur');
            if (timeoutId) clearTimeout(timeoutId);
            resolve({
              success: false,
              status: 'echec' as any,
              message: result.message || 'Erreur lors de la vérification du paiement'
            });
            return;
          }
          
          console.log(`⏳ Prochaine vérification dans ${intervalMs / 1000}s (erreur backend temporaire)...`);
          timeoutId = setTimeout(checkPayment, intervalMs);
          return;
        }
        
        const successStatuses = ['paye', 'paid', 'processed'];
        const failureStatuses = ['echec', 'failed', 'rembourse', 'refunded'];
        
        const statusLower = result.status.toLowerCase();
        
        if (successStatuses.includes(statusLower) || failureStatuses.includes(statusLower)) {
          console.log('✅ Paiement terminé:', result.status);
          if (timeoutId) clearTimeout(timeoutId);
          
          if (successStatuses.includes(statusLower)) {
            result.status = 'paye' as any;
          } else if (failureStatuses.includes(statusLower)) {
            if (statusLower === 'rembourse' || statusLower === 'refunded') {
              result.status = 'rembourse' as any;
            } else {
              result.status = 'echec' as any;
            }
          }
          resolve(result);
          return;
        }
        
        if (Date.now() - startTime >= durationMs) {
          console.log('⏱️ Timeout de vérification atteint');
          if (timeoutId) clearTimeout(timeoutId);
          resolve(result);
          return;
        }
        
        console.log(`⏳ Prochaine vérification dans ${intervalMs / 1000}s...`);
        timeoutId = setTimeout(checkPayment, intervalMs);
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        
        if (Date.now() - startTime >= durationMs) {
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
          return;
        }
        
        console.log(`⏳ Nouvelle tentative dans ${intervalMs / 1000}s après erreur...`);
        timeoutId = setTimeout(checkPayment, intervalMs);
      }
    };
    
    checkPayment();
  });
}

export type { PaiementMobileData, PaiementMobileResponse, VerificationPaiementResponse };
