/**
 * Service pour l'abonnement aux notifications push web (VAPID) du vendeur
 */

import api from '@/lib/api';

export interface VapidPublicKeyResponse {
  success: boolean;
  data: { publicKey: string };
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Récupère la clé publique VAPID nécessaire à `pushManager.subscribe()`
 */
export async function getVapidPublicKey(): Promise<string> {
  const response = await api.get<VapidPublicKeyResponse>('/push/vapid-public-key');

  if (!response.success || !response.data?.publicKey) {
    throw new Error('Service de notifications push indisponible');
  }

  return response.data.publicKey;
}

/**
 * Enregistre l'abonnement push du vendeur connecté auprès du backend
 */
export async function subscribeToPush(subscription: PushSubscriptionPayload): Promise<void> {
  await api.post('/push/subscribe', subscription);
}

/**
 * Supprime un abonnement push (désabonnement)
 */
export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  await api.delete('/push/unsubscribe', { body: JSON.stringify({ endpoint }) });
}
