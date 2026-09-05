/**
 * Service pour le programme d'affiliation : mémorisation du code de tracking
 * (?ref=CODE, valable sur n'importe quelle page du site), inscription et
 * validation en direct d'un code affilié.
 */

import api from '@/lib/api';

const CODE_KEY = 'marche241_ref_code';
const CODE_EXPIRY_KEY = 'marche241_ref_expiry';
const DUREE_MEMORISATION_JOURS = 30;

/**
 * Mémorise un code affilié pour ~1 mois, y compris si l'utilisateur navigue
 * ensuite sans le paramètre ?ref= dans l'URL.
 */
export function memoriserCodeAffilie(code: string): void {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + DUREE_MEMORISATION_JOURS);

    localStorage.setItem(CODE_KEY, code);
    localStorage.setItem(CODE_EXPIRY_KEY, expiryDate.toISOString());
  } catch (error) {
    console.error('Erreur lors de la mémorisation du code affilié:', error);
  }
}

/**
 * Récupère le code affilié mémorisé, ou null s'il est absent ou expiré.
 */
export function getCodeAffilieMemorise(): string | null {
  try {
    const code = localStorage.getItem(CODE_KEY);
    const expiry = localStorage.getItem(CODE_EXPIRY_KEY);

    if (!code || !expiry) {
      return null;
    }

    if (new Date() > new Date(expiry)) {
      return null;
    }

    return code;
  } catch (error) {
    console.error('Erreur lors de la lecture du code affilié:', error);
    return null;
  }
}

/**
 * Efface le code affilié mémorisé — à appeler après succès d'une commande.
 */
export function effacerCodeAffilieMemorise(): void {
  try {
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(CODE_EXPIRY_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du code affilié:', error);
  }
}

interface ResoudreCodeResponse {
  success: boolean;
  valide: boolean;
}

/**
 * Valide un code affilié en direct (checkout, page d'inscription), sans
 * jamais bloquer le flux appelant en cas d'échec réseau.
 */
export async function validerCodeAffilie(code: string): Promise<boolean> {
  try {
    const response = await api.get<ResoudreCodeResponse>(`/affilies/resoudre/${encodeURIComponent(code)}`);
    return response.valide;
  } catch (error) {
    console.error('Erreur lors de la validation du code affilié:', error);
    return false;
  }
}

export interface InscrireAffilieData {
  nom: string;
  email: string;
  telephone: string;
  pays: string;
}

interface Affilie {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  pays: string;
  code: string;
  statut: 'actif' | 'inactif';
  taux_commission: number;
}

interface InscrireAffilieResponse {
  success: boolean;
  message: string;
  affilie: Affilie;
  lien_principal: string;
}

/**
 * Inscrit un nouvel affilié — nom, email, WhatsApp, pays uniquement.
 */
export async function inscrireAffilie(data: InscrireAffilieData): Promise<InscrireAffilieResponse> {
  return api.post<InscrireAffilieResponse>('/affilies/inscription', data);
}

// ============================================
// Session du mini dashboard affilié (JWT indépendant du token vendeur)
// ============================================

const AFFILIATE_TOKEN_KEY = 'marche241_affiliate_token';

export function getAffiliateToken(): string | null {
  try {
    return localStorage.getItem(AFFILIATE_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAffiliateToken(token: string): void {
  try {
    localStorage.setItem(AFFILIATE_TOKEN_KEY, token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token affilié:', error);
  }
}

export function clearAffiliateToken(): void {
  try {
    localStorage.removeItem(AFFILIATE_TOKEN_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression du token affilié:', error);
  }
}

const AFFILIATE_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

/**
 * Requête HTTP dédiée au dashboard affilié : porte le jeton affilié, jamais
 * le jeton vendeur (session totalement séparée de l'espace vendeur/admin).
 */
async function affiliateRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAffiliateToken();
  const response = await fetch(`${AFFILIATE_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `Erreur HTTP ${response.status}`);
  }

  return body as T;
}

interface DemanderCodeConnexionResponse {
  success: boolean;
  message: string;
}

/** Réponse générique dans tous les cas — ne confirme jamais l'existence d'un compte. */
export async function demanderCodeConnexionAffilie(email: string): Promise<DemanderCodeConnexionResponse> {
  return affiliateRequest<DemanderCodeConnexionResponse>('/affilies/connexion/demander-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

interface VerifierCodeConnexionResponse {
  success: boolean;
  message: string;
  affilie: Affilie;
  token: string;
}

export async function verifierCodeConnexionAffilie(
  email: string,
  code: string
): Promise<VerifierCodeConnexionResponse> {
  const response = await affiliateRequest<VerifierCodeConnexionResponse>('/affilies/connexion/verifier', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  setAffiliateToken(response.token);
  return response;
}

export interface ResumeAffilie {
  soldeDue: number;
  totalVerse: number;
  commandesLivrees: number;
}

interface ProfilEtSoldeResponse {
  success: boolean;
  affilie: Affilie;
  resume: ResumeAffilie;
}

export async function getProfilEtSoldeAffilie(): Promise<ProfilEtSoldeResponse> {
  return affiliateRequest<ProfilEtSoldeResponse>('/affilies/moi');
}

export async function updateProfilAffilie(
  data: Pick<InscrireAffilieData, 'nom' | 'email' | 'telephone' | 'pays'>
): Promise<{ success: boolean; message: string; affilie: Affilie }> {
  return affiliateRequest('/affilies/moi', { method: 'PUT', body: JSON.stringify(data) });
}

export interface CommissionAffiliee {
  id: number;
  commande_id: number;
  boutique_id: number;
  montant_base: number;
  taux: number;
  montant_commission: number;
  statut: 'due' | 'payee' | 'annulee';
  reference_versement: string | null;
  date_creation: string;
  date_versement: string | null;
}

interface HistoriqueCommissionsResponse {
  success: boolean;
  donnees: CommissionAffiliee[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}

export async function getHistoriqueCommissionsAffilie(
  page: number = 1,
  limite: number = 10
): Promise<HistoriqueCommissionsResponse> {
  return affiliateRequest<HistoriqueCommissionsResponse>(`/affilies/moi/commissions?page=${page}&limite=${limite}`);
}
