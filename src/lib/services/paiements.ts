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

export interface WebhookPaiementData {
  billId: string;
  boutique: {
    id: number;
    nom: string;
    slug: string;
    telephone?: string;
    whatsapp?: string;
  };
  commande: {
    id: number;
    numero_commande: string;
    total: number;
    sous_total: number;
    frais_livraison: number;
    taxes: number;
  };
  produits: Record<number, {
    id: number;
    nom: string;
    prix_unitaire: number;
    quantite: number;
    sous_total: number;
    variants?: Record<string, string>;
    variants_string?: string;
    image_url?: string;
  }>;
  client: {
    nom: string;
    telephone: string;
    whatsapp: string; // Format: "24162648538" (sans +)
    email: string;
    adresse: string;
    ville: string;
    commune: string;
  };
  paiement: {
    montant: number;
    type_paiement: string;
    methode_paiement: string;
    reference: string;
  };
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
 * Envoyer les données de paiement au webhook
 * @param webhookData - Données à envoyer au webhook
 */
async function envoyerWebhookPaiement(webhookData: WebhookPaiementData): Promise<void> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_PAYMENT;
    
    if (!webhookUrl) {
      console.warn('⚠️ WEBHOOK_PAYMENT non configuré, envoi ignoré');
      return;
    }

    console.log('📤 Envoi des données au webhook:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (response.ok) {
      console.log('✅ Webhook envoyé avec succès');
    } else {
      console.error('❌ Erreur lors de l\'envoi du webhook:', response.status, response.statusText);
    }
  } catch (error) {
    // Ne pas bloquer le flux principal si le webhook échoue
    console.error('❌ Erreur lors de l\'envoi du webhook:', error);
  }
}

/**
 * Initier un paiement mobile
 * @param paiementData - Données du paiement à initier
 * @param webhookData - Données optionnelles à envoyer au webhook après initiation
 * @returns Promise<PaiementMobileResponse>
 */
export async function initierPaiementMobile(
  paiementData: PaiementMobileData,
  webhookData?: WebhookPaiementData
): Promise<PaiementMobileResponse> {
  try {
    const response = await api.post<PaiementMobileResponse>('/paiements/mobile', paiementData);
    
    // Envoyer les données au webhook si disponibles
    if (response.success && response.bill_id && webhookData) {
      // S'assurer que le billId dans webhookData correspond à celui retourné
      const webhookDataWithBillId = {
        ...webhookData,
        billId: response.bill_id
      };
      
      // Envoyer au webhook en arrière-plan (ne pas attendre)
      envoyerWebhookPaiement(webhookDataWithBillId).catch(console.error);
    }
    
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
    const response = await api.get<any>(`/paiements/verification/${billId}`);
    
    // Extraire le statut de différentes sources possibles
    let status: string | undefined;
    
    if (response.transaction?.statut) {
      // Le statut vient de transaction.statut
      status = response.transaction.statut;
    } else if (response.state) {
      // Le statut vient de state
      status = response.state;
    } else if (response.status) {
      // Le statut vient de status
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
 * @param billId - ID de la facture à vérifier
 * @param durationMs - Durée en millisecondes (défaut: 60000 = 1 minute)
 * @param intervalMs - Intervalle entre les vérifications (défaut: 5000 = 5 secondes)
 * @param cancelSignal - Signal d'annulation optionnel
 * @returns Promise<VerificationPaiementResponse>
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
      // Vérifier si l'annulation a été demandée
      if (cancelSignal?.cancelled) {
        console.log('🛑 Vérification annulée par l\'utilisateur');
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error('Vérification annulée par l\'utilisateur'));
        return;
      }

      try {
        const result = await verifierPaiement(billId);
        
        console.log('🔍 Vérification paiement:', { billId, status: result.status, result });
        
        // Si la réponse contient une erreur ou pas de statut, considérer comme en attente
        if (!result.success || !result.status) {
          console.warn('⚠️ Réponse invalide ou erreur backend:', result);
          
          // Si on a dépassé la durée limite, on arrête avec erreur
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
          
          // Continuer à vérifier
          console.log(`⏳ Prochaine vérification dans ${intervalMs / 1000}s (erreur backend temporaire)...`);
          timeoutId = setTimeout(checkPayment, intervalMs);
          return;
        }
        
        // Statuts de succès (paiement confirmé)
        const successStatuses = ['paye', 'paid', 'processed'];
        // Statuts d'échec
        const failureStatuses = ['echec', 'failed', 'rembourse', 'refunded'];
        
        const statusLower = result.status.toLowerCase();
        
        // Si le paiement est terminé (succès ou échec), on arrête
        if (successStatuses.includes(statusLower) || failureStatuses.includes(statusLower)) {
          console.log('✅ Paiement terminé:', result.status);
          if (timeoutId) clearTimeout(timeoutId);
          
          // Normaliser le statut pour la compatibilité
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
        
        // Si on a dépassé la durée limite, on arrête
        if (Date.now() - startTime >= durationMs) {
          console.log('⏱️ Timeout de vérification atteint');
          if (timeoutId) clearTimeout(timeoutId);
          resolve(result); // Retourner le dernier statut
          return;
        }
        
        // Programmer la prochaine vérification
        console.log(`⏳ Prochaine vérification dans ${intervalMs / 1000}s...`);
        timeoutId = setTimeout(checkPayment, intervalMs);
        
      } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        
        // Si on a dépassé la durée limite, on arrête avec erreur
        if (Date.now() - startTime >= durationMs) {
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
          return;
        }
        
        // Sinon, continuer à essayer
        console.log(`⏳ Nouvelle tentative dans ${intervalMs / 1000}s après erreur...`);
        timeoutId = setTimeout(checkPayment, intervalMs);
      }
    };
    
    // Démarrer la première vérification
    checkPayment();
  });
}

export type { PaiementMobileData, PaiementMobileResponse, VerificationPaiementResponse };
