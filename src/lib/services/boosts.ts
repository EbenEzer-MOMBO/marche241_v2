/**
 * Service pour la gestion du boost publicitaire (Meta Ads)
 */

import api from '@/lib/api';

export interface ForfaitBoost {
  code: string;
  nom: string;
  prix_vendeur_fcfa: number;
  duree_jours: number;
  reciblage?: boolean;
}

export interface Boost {
  id: number;
  boutique_id: number;
  forfait_code: string;
  statut:
    | 'en_attente_paiement'
    | 'en_attente_revue'
    | 'actif'
    | 'rejete'
    | 'en_pause'
    | 'termine'
    | 'erreur';
  prix_vendeur_fcfa: number;
  duree_jours: number;
  zones: string[];
  date_debut?: string | null;
  date_fin?: string | null;
  raison_rejet?: string | null;
  date_creation: string;
}

interface ForfaitsResponse {
  success: boolean;
  forfaits: ForfaitBoost[];
}

interface CreerBoostResponse {
  success: boolean;
  message?: string;
  boost: Boost;
}

interface ListeBoostsResponse {
  success: boolean;
  donnees: Boost[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}

interface BoostDetailResponse {
  success: boolean;
  boost: Boost;
  evenements: Array<{ id: number; type_evenement: string; donnees: unknown; date_creation: string }>;
  stats: Array<{ impressions: number; clics: number; depense_fcfa: number; date_snapshot: string }>;
}

/**
 * Liste les forfaits de boost disponibles
 */
export async function getForfaits(): Promise<ForfaitBoost[]> {
  const response = await api.get<ForfaitsResponse>('/boosts/forfaits');
  return response.forfaits || [];
}

/**
 * Crée un boost pour une boutique (statut initial en_attente_paiement)
 */
export async function creerBoost(data: {
  boutique_id: number;
  forfait_code: string;
  zones: string[];
}): Promise<Boost> {
  const response = await api.post<CreerBoostResponse>('/boosts', data);
  return response.boost;
}

/**
 * Liste paginée des boosts d'une boutique
 */
export async function listerMesBoosts(boutiqueId: number, page: number = 1, limite: number = 10): Promise<ListeBoostsResponse> {
  return api.get<ListeBoostsResponse>(`/boosts/boutiques/${boutiqueId}?page=${page}&limite=${limite}`);
}

/**
 * Détail d'un boost (statut, stats, historique)
 */
export async function getBoostDetail(boostId: number): Promise<BoostDetailResponse> {
  return api.get<BoostDetailResponse>(`/boosts/${boostId}`);
}
