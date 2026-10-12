import { api, ApiError } from '@/lib/api';
import type {
  AvisDetaille,
  AvisPublic,
  InvitationAvisPublique,
  ResumeAvisProduit,
  StatutAvis,
} from '@/lib/database-types';

/**
 * Avis produits vérifiés par achat : invitation par lien WhatsApp (sans compte),
 * avis publiés sur la fiche produit, et gestion côté vendeur (réponse, signalement).
 */

/** Nombre d'avis par page sur la fiche produit (partagé par le rendu serveur et la section client). */
export const AVIS_PAR_PAGE = 5;

export interface Pagination {
  page: number;
  limite: number;
  total: number;
  pages: number;
}

/** Erreur métier de l'API avis (code stable : INVITATION_INVALIDE, AVIS_DESACTIVES, SOUMISSION_TROP_RAPIDE…). */
export class AvisErreur extends Error {
  constructor(message: string, public code: string | null, public status: number) {
    super(message);
    this.name = 'AvisErreur';
  }
}

function versAvisErreur(err: unknown, defaut: string): AvisErreur {
  if (err instanceof ApiError) {
    return new AvisErreur(err.response?.message || err.message || defaut, err.response?.code ?? null, err.status);
  }
  return new AvisErreur(defaut, null, 0);
}

// ---------------------------------------------------------------------------
// Public : invitation
// ---------------------------------------------------------------------------

export async function getInvitationAvis(
  jeton: string
): Promise<{ invitation: InvitationAvisPublique; longueurMax: number }> {
  try {
    const r = await api.get<{ success: boolean; invitation: InvitationAvisPublique; longueur_max_commentaire: number }>(
      `/avis/invitation/${encodeURIComponent(jeton)}`
    );
    return { invitation: r.invitation, longueurMax: r.longueur_max_commentaire };
  } catch (err) {
    throw versAvisErreur(err, 'Impossible de charger votre invitation');
  }
}

export interface SoumissionAvis {
  avis: Array<{ produit_id: number; note: number; commentaire?: string }>;
  site_web: string;
  rempli_en_ms: number;
  turnstileToken: string | null;
}

export interface ResultatSoumissionAvis {
  crees: number;
  en_moderation: number;
  ignores: number[];
  terminee: boolean;
}

export async function soumettreAvis(jeton: string, donnees: SoumissionAvis): Promise<ResultatSoumissionAvis> {
  try {
    const r = await api.post<{ success: boolean; resultat: ResultatSoumissionAvis }>(
      `/avis/invitation/${encodeURIComponent(jeton)}`,
      donnees
    );
    return r.resultat;
  } catch (err) {
    throw versAvisErreur(err, "Votre avis n'a pas pu être envoyé");
  }
}

// ---------------------------------------------------------------------------
// Public : avis d'un produit
// ---------------------------------------------------------------------------

export async function getAvisProduit(
  produitId: number,
  page = 1,
  limite = 5
): Promise<{ avis: AvisPublic[]; resume: ResumeAvisProduit; pagination: Pagination }> {
  const r = await api.get<{ success: boolean; avis: AvisPublic[]; resume: ResumeAvisProduit; pagination: Pagination }>(
    `/avis/produit/${produitId}?page=${page}&limite=${limite}`
  );
  return { avis: r.avis, resume: r.resume, pagination: r.pagination };
}

// ---------------------------------------------------------------------------
// Vendeur
// ---------------------------------------------------------------------------

export interface FiltresAvisVendeur {
  statut?: StatutAvis;
  boutique_id?: number;
  produit_id?: number;
  note?: number;
  sans_reponse?: boolean;
  page?: number;
}

export async function getAvisVendeur(
  filtres: FiltresAvisVendeur = {}
): Promise<{ avis: AvisDetaille[]; sansReponse: number; pagination: Pagination }> {
  const params = new URLSearchParams();
  Object.entries(filtres).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== '' && valeur !== false) params.set(cle, String(valeur));
  });
  const qs = params.toString();
  const r = await api.get<{ success: boolean; avis: AvisDetaille[]; sans_reponse: number; pagination: Pagination }>(
    `/avis/vendeur${qs ? `?${qs}` : ''}`
  );
  return { avis: r.avis, sansReponse: r.sans_reponse, pagination: r.pagination };
}

export async function repondreAvis(id: number, reponse: string): Promise<AvisDetaille> {
  try {
    const r = await api.put<{ success: boolean; avis: AvisDetaille }>(`/avis/vendeur/${id}/reponse`, { reponse });
    return r.avis;
  } catch (err) {
    throw versAvisErreur(err, "La réponse n'a pas pu être enregistrée");
  }
}

export async function signalerAvis(id: number, motif: string): Promise<AvisDetaille> {
  try {
    const r = await api.post<{ success: boolean; avis: AvisDetaille }>(`/avis/vendeur/${id}/signaler`, { motif });
    return r.avis;
  } catch (err) {
    throw versAvisErreur(err, "Le signalement n'a pas pu être envoyé");
  }
}
