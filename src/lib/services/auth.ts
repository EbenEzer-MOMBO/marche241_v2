import { api } from '../api';

export interface DemanderCodeData {
  email: string;
}

export interface DemanderCodeResponse {
  success: boolean;
  message: string;
  code?: string;
}

export interface VerifierCodeData {
  email: string;
  code: string;
}

export interface VerifierCodeResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    vendeur: {
      id: string;
      email: string;
      nom: string;
      telephone?: string;
    };
  };
}

/**
 * Demander un code de vérification par email
 * @param data - Email du vendeur
 * @returns Promise<DemanderCodeResponse>
 */
export async function demanderCodeVerification(data: DemanderCodeData): Promise<DemanderCodeResponse> {
  try {
    const response = await api.post<DemanderCodeResponse>('/vendeurs/code', data);
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la demande de code:', error);
    
    // Gestion des erreurs selon les codes de statut
    if (error.response?.status === 400) {
      throw new Error('L\'adresse email n\'est pas valide');
    } else if (error.response?.status === 404) {
      throw new Error('Aucun compte vendeur trouvé avec cette adresse email. Veuillez vous inscrire d\'abord.');
    } else if (error.response?.status === 500) {
      throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
    } else {
      throw new Error('Impossible d\'envoyer le code. Veuillez réessayer.');
    }
  }
}

/**
 * Vérifier le code de vérification
 * @param data - Email et code du vendeur
 * @returns Promise<VerifierCodeResponse>
 */
export async function verifierCode(data: VerifierCodeData): Promise<VerifierCodeResponse> {
  try {
    const response = await api.post<VerifierCodeResponse>('/vendeurs/verification', data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    throw new Error('Code incorrect ou expiré. Veuillez réessayer.');
  }
}

