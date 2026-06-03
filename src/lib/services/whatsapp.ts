/**
 * Service pour vérifier et interagir avec WhatsApp via le backend de l'application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export interface CheckWhatsAppResponse {
  existsWhatsapp: boolean;
}

/**
 * Vérifie si un numéro WhatsApp existe via l'API backend sécurisée
 * @param phoneNumber - Numéro de téléphone au format international (ex: 24162648538)
 * @returns Promise avec le résultat de la vérification
 */
export async function checkWhatsAppNumber(phoneNumber: string): Promise<CheckWhatsAppResponse> {
  try {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    const url = `${API_BASE_URL}/whatsapp/check-number`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telephone: cleanNumber
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return {
      existsWhatsapp: !!data.existsWhatsapp
    };
  } catch (error) {
    console.error('Erreur lors de la vérification WhatsApp via le backend:', error);
    throw new Error('Impossible de vérifier le numéro WhatsApp');
  }
}

/**
 * Envoie un code de vérification via WhatsApp via l'API backend sécurisée
 * @param phoneNumber - Numéro de téléphone
 * @param code - Code de vérification à envoyer
 */
export async function sendWhatsAppCode(phoneNumber: string, code: string): Promise<boolean> {
  try {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    const url = `${API_BASE_URL}/whatsapp/envoyer-message`;
    const message = `Votre code de vérification Marché241 est: ${code}\n\nCe code expire dans 10 minutes.`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telephone: cleanNumber,
        message: message
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message WhatsApp via le backend:', error);
    return false;
  }
}


