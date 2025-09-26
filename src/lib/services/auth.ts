import { api } from '../api';

export interface InscriptionData {
  email: string;
  nom: string;
  telephone: string;
  ville: string;
}

export interface InscriptionResponse {
  success: boolean;
  message: string;
  vendeur?: {
    id: number;
    email: string;
    nom: string;
    telephone: string;
    code_verification: string;
    code_expiration: string;
    tentatives_code: number;
    derniere_tentative: string;
    date_creation: string;
    date_modification: string;
    statut: string;
    photo_profil: string;
    ville: string;
    verification_telephone: boolean;
    verification_email: boolean;
    derniere_connexion: string;
  };
  code?: string;
}

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
  vendeur?: {
    id: number;
    email: string;
    nom: string;
    statut: string;
  };
  token?: string;
  tentatives_restantes?: number;
}

export interface BoutiqueData {
  id: number;
  nom: string;
  slug: string;
  description: string;
  vendeur_id: number;
  logo?: string;
  couleur_primaire?: string;
  couleur_secondaire?: string;
  adresse?: string;
  telephone?: string;
  statut: 'active' | 'inactive' | 'suspended';
  date_creation: string;
  date_modification: string;
  nombre_produits?: number;
  note_moyenne?: number;
  nombre_avis?: number;
}

export interface BoutiqueResponse {
  success: boolean;
  message: string;
  boutique?: BoutiqueData;
}

export interface BoutiquesListResponse {
  success: boolean;
  message: string;
  boutiques?: BoutiqueData[];
}

export interface CreerBoutiqueData {
  nom: string;
  description: string;
  adresse: string;
  ville: string;
  telephone?: string;
  email?: string;
}

export interface CreerBoutiqueResponse {
  success: boolean;
  message: string;
  boutique?: BoutiqueData;
}

/**
 * Inscrire un nouveau vendeur
 * @param data - Données d'inscription du vendeur
 * @returns Promise<InscriptionResponse>
 */
export async function inscrireVendeur(data: InscriptionData): Promise<InscriptionResponse> {
  try {
    const response = await api.post<InscriptionResponse>('/vendeurs/inscription', data);
    return response;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Vérifier si c'est une ApiError avec un status
    if (error.status) {
      if (error.status === 400) {
        throw new Error('Données invalides. Veuillez vérifier vos informations.');
      } else if (error.status === 409) {
        // Gestion spécifique pour les conflits email/téléphone
        if (error.response?.message?.includes('email')) {
          throw new Error('Un compte avec cette adresse email existe déjà');
        } else if (error.response?.message?.includes('téléphone')) {
          throw new Error('Un compte avec ce numéro de téléphone existe déjà');
        } else {
          throw new Error('Un compte avec ces informations existe déjà');
        }
      } else if (error.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible de créer le compte. Veuillez réessayer.');
  }
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
    
    // Vérifier si c'est une ApiError avec un status
    if (error.status) {
      if (error.status === 400) {
        throw new Error('L\'adresse email n\'est pas valide');
      } else if (error.status === 404) {
        throw new Error('Aucun compte vendeur trouvé avec cette adresse email. Veuillez vous inscrire d\'abord.');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible d\'envoyer le code. Veuillez réessayer.');
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
  } catch (error: any) {
    console.error('Erreur lors de la vérification du code:', error);
    
    // Vérifier si c'est une ApiError avec un status
    if (error.status) {
      if (error.status === 400) {
        throw new Error('Code de vérification invalide ou expiré');
      } else if (error.status === 404) {
        throw new Error('Vendeur non trouvé');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Code incorrect ou expiré. Veuillez réessayer.');
  }
}

/**
 * Récupérer les boutiques d'un vendeur authentifié
 * @param vendeurId - ID du vendeur
 * @returns Promise<BoutiquesListResponse>
 */
export async function getBoutiquesVendeur(vendeurId: number): Promise<BoutiquesListResponse> {
  try {
    const response = await api.get<{ success: boolean; boutiques: BoutiqueData[] }>(`/boutiques/vendeur/${vendeurId}`);
    
    // L'API retourne déjà la structure avec success et boutiques
    return {
      success: response.success,
      message: response.success ? 'Boutiques récupérées avec succès' : 'Aucune boutique trouvée',
      boutiques: response.boutiques || []
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des boutiques:', error);
    
    // Vérifier si c'est une ApiError avec un status
    if (error.status) {
      if (error.status === 404) {
        // Pas de boutique trouvée - c'est normal pour un nouveau vendeur
        return {
          success: false,
          message: 'Aucune boutique trouvée pour ce vendeur',
          boutiques: []
        };
      } else if (error.status === 401) {
        throw new Error('Non autorisé. Veuillez vous reconnecter.');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible de récupérer les informations des boutiques.');
  }
}

/**
 * Créer une nouvelle boutique pour un vendeur
 * @param data - Données de création de la boutique
 * @returns Promise<CreerBoutiqueResponse>
 */
export async function creerBoutique(data: CreerBoutiqueData): Promise<CreerBoutiqueResponse> {
  try {
    const response = await api.post<CreerBoutiqueResponse>('/boutiques', data);
    return response;
  } catch (error: any) {
    console.error('Erreur lors de la création de la boutique:', error);
    
    // Vérifier si c'est une ApiError avec un status
    if (error.status) {
      if (error.status === 400) {
        throw new Error('Données invalides. Veuillez vérifier vos informations.');
      } else if (error.status === 401) {
        throw new Error('Non autorisé. Veuillez vous reconnecter.');
      } else if (error.status === 409) {
        throw new Error('Une boutique avec ce nom existe déjà dans cette ville.');
      } else if (error.status === 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
    }
    
    // Fallback pour les autres erreurs
    throw new Error('Impossible de créer la boutique. Veuillez réessayer.');
  }
}
