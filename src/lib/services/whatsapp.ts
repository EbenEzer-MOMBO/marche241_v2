/**
 * Service pour vérifier et interagir avec WhatsApp via Green API
 */

const GREEN_API_URL = process.env.NEXT_PUBLIC_GREEN_API_URL || 'https://7105.api.green-api.com';
const INSTANCE_ID = process.env.NEXT_PUBLIC_GREEN_API_INSTANCE || '7105342125';
const API_TOKEN = process.env.NEXT_PUBLIC_GREEN_API_TOKEN || '7349b37b357042daa2f4e7b507ccaf01912271222e1b4a68bc';

export interface CheckWhatsAppResponse {
  existsWhatsapp: boolean;
}

/**
 * Vérifie si un numéro WhatsApp existe
 * @param phoneNumber - Numéro de téléphone au format international (ex: 24162648538)
 * @returns Promise avec le résultat de la vérification
 */
export async function checkWhatsAppNumber(phoneNumber: string): Promise<CheckWhatsAppResponse> {
  try {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    const url = `${GREEN_API_URL}/waInstance${INSTANCE_ID}/checkWhatsapp/${API_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: parseInt(cleanNumber, 10)
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data: CheckWhatsAppResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification WhatsApp:', error);
    throw new Error('Impossible de vérifier le numéro WhatsApp');
  }
}

/**
 * Envoie un code de vérification via WhatsApp
 * @param phoneNumber - Numéro de téléphone
 * @param code - Code de vérification à envoyer
 */
export async function sendWhatsAppCode(phoneNumber: string, code: string): Promise<boolean> {
  try {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    const url = `${GREEN_API_URL}/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`;
    
    const message = `Votre code de vérification Marché241 est: ${code}\n\nCe code expire dans 10 minutes.`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: `${cleanNumber}@c.us`,
        message: message
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message WhatsApp:', error);
    return false;
  }
}

