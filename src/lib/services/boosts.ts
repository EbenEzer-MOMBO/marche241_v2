/**
 * Boost publicitaire Meta Ads (Facebook & Instagram) — espace vendeur.
 * Routes API : /boosts (cf. marche241-api/src/routes/boost.routes.ts).
 */

import api, { ApiError } from '@/lib/api';
import config from '@/lib/config';
import type {
  Boost,
  BoostInsightJour,
  CiblageBoost,
  ObjectifBoost,
  PackBoost,
  StatutBoost,
  TypeCibleBoost
} from '@/lib/database-types';

export interface OptionCiblage {
  code: string;
  nom: string;
}

export interface ParametresBoost {
  total_min_fcfa: number;
  total_max_fcfa: number;
  duree_min_jours: number;
  duree_max_jours: number;
  commission_bps: number;
  commission_min_fcfa: number;
  tva_bps: number;
  /** Frais d'encaissement non remboursables (250 = 2,5 % du total payé). */
  frais_encaissement_bps: number;
  /** Frais fixe ajouté à une publicité vidéo (absent si l'API est plus ancienne). Remboursé si la pub n'a jamais diffusé. */
  frais_video_fcfa?: number;
  budget_jour_min_fcfa: number;
  /** Plancher Meta par jour (tous objectifs), converti en FCFA par l'API (absent si l'API est plus ancienne). */
  budget_jour_min_meta_fcfa?: number;
  /** Ancien nom de `budget_jour_min_meta_fcfa` (API non redéployée). */
  budget_jour_min_whatsapp_fcfa?: number;
  packs: PackBoost[];
  kill_switch: boolean;
  /** Types de publicité disponibles : la mise en avant plateforme n'est pas encore ouverte. */
  types: { plateforme: boolean; meta: boolean };
  durees: number[];
  pays: OptionCiblage[];
  villes: Array<{ cle: string; nom: string }>;
  langues: Array<{ locale: string; nom: string }>;
  /** `groupe` = code de `groupes_interets` (absent si l'API est plus ancienne). */
  interets: Array<OptionCiblage & { groupe?: string }>;
  groupes_interets?: OptionCiblage[];
  statuts: Record<StatutBoost, string>;
  mode_simule: boolean;
}

export interface DevisBoost {
  budget_media_fcfa: number;
  commission_bps: number;
  commission_fcfa: number;
  /** Frais fixe d'une créa vidéo, déduit avant la commission (0 pour une image). */
  frais_video_fcfa?: number;
  tva_bps: number;
  tva_fcfa: number;
  total_fcfa: number;
  duree_jours: number;
  budget_jour_fcfa: number;
  /** Part du total retenue en cas de remboursement (frais eBilling). */
  frais_encaissement_fcfa: number;
  /** Plancher par jour de l'objectif demandé et total minimum pour la durée (API récente). */
  budget_jour_min_fcfa?: number;
  total_minimum_fcfa?: number;
}

export interface DonneesBrouillonBoost {
  type_cible?: TypeCibleBoost;
  produit_id?: number | null;
  objectif?: ObjectifBoost;
  nom?: string;
  total_fcfa?: number;
  duree_jours?: number;
  ciblage?: Partial<CiblageBoost>;
  url_destination?: string | null;
  whatsapp_e164?: string | null;
  titre?: string | null;
  texte_principal?: string | null;
  description?: string | null;
  image_url?: string | null;
  media_type?: 'image' | 'video';
  video_url?: string | null;
  video_duree_sec?: number | null;
}

export interface EvenementBoostVendeur {
  id: number;
  type_evenement: string;
  date_creation: string;
}

export interface TransactionBoostVendeur {
  id: number;
  montant: number;
  statut: string;
  methode_paiement: string | null;
  date_creation: string;
  date_confirmation: string | null;
}

export interface TotauxBoost {
  depense_fcfa: number;
  impressions: number;
  portee: number;
  clics: number;
  messages: number;
}

export interface DetailBoost {
  boost: Boost;
  insights: BoostInsightJour[];
  totaux: TotauxBoost;
  evenements: EvenementBoostVendeur[];
  transactions: TransactionBoostVendeur[];
}

export interface EstimationImpressions {
  total_fcfa: number;
  budget_media_fcfa: number;
  budget_jour_fcfa: number;
  min: number | null;
  max: number | null;
  source: 'compte' | 'defaut';
}

export interface ErreurChamp {
  field: string;
  message: string;
}

/** Erreurs de validation par champ renvoyées par l'API (code VALIDATION_ERROR). */
export function erreursDeChamps(err: unknown): ErreurChamp[] {
  if (err instanceof ApiError && Array.isArray(err.response?.errors)) return err.response.errors as ErreurChamp[];
  return [];
}

export function messageErreur(err: unknown, defaut: string): string {
  if (err instanceof Error && err.message) return err.message;
  return defaut;
}

type Reponse<T> = { success: boolean; message?: string } & T;

function verifier<T extends { success: boolean; message?: string }>(r: T, defaut: string): T {
  if (!r.success) throw new Error(r.message || defaut);
  return r;
}

export async function getParametresBoost(): Promise<ParametresBoost> {
  const r = await api.get<Reponse<{ parametres: ParametresBoost }>>('/boosts/parametres');
  return verifier(r, 'Paramètres du boost indisponibles').parametres;
}

export async function getPrefillBoost(boutiqueId: number, produitId?: number | null): Promise<DonneesBrouillonBoost & { type_cible: TypeCibleBoost }> {
  const query = `boutique_id=${boutiqueId}${produitId ? `&produit_id=${produitId}` : ''}`;
  const r = await api.get<Reponse<{ prefill: DonneesBrouillonBoost & { type_cible: TypeCibleBoost } }>>(`/boosts/prefill?${query}`);
  return verifier(r, 'Pré-remplissage indisponible').prefill;
}

export async function getDevisBoost(
  totalFcfa: number,
  dureeJours: number,
  objectif?: ObjectifBoost,
  mediaType: 'image' | 'video' = 'image'
): Promise<DevisBoost> {
  const r = await api.post<Reponse<{ devis: DevisBoost }>>('/boosts/devis', {
    total_fcfa: totalFcfa,
    duree_jours: dureeJours,
    media_type: mediaType,
    ...(objectif ? { objectif } : {})
  });
  return verifier(r, 'Devis indisponible').devis;
}

export async function estimerAudienceBoost(ciblage: Partial<CiblageBoost>): Promise<{ min: number | null; max: number | null; disponible: boolean }> {
  const { etape_wizard: _etape, ...ciblageSansEtape } = ciblage;
  void _etape;
  const r = await api.post<Reponse<{ audience: { min: number | null; max: number | null; disponible: boolean } }>>(
    '/boosts/estimation/audience',
    { ciblage: ciblageSansEtape }
  );
  return verifier(r, 'Estimation indisponible').audience;
}

export async function estimerImpressionsBoost(
  totauxFcfa: number[],
  dureeJours: number,
  mediaType: 'image' | 'video' = 'image'
): Promise<EstimationImpressions[]> {
  const r = await api.post<Reponse<{ impressions: EstimationImpressions[] }>>('/boosts/estimation/impressions', {
    totaux_fcfa: totauxFcfa,
    duree_jours: dureeJours,
    media_type: mediaType
  });
  return verifier(r, 'Estimation indisponible').impressions;
}

/** Boost de la liste vendeur : produit promu et totaux de diffusion en plus. */
export type BoostListe = Boost & {
  produit_nom: string | null;
  totaux: { impressions: number; clics: number; messages: number };
};

export async function getBoostsBoutique(boutiqueId: number): Promise<BoostListe[]> {
  const r = await api.get<Reponse<{ boosts: BoostListe[] }>>(`/boosts/boutique/${boutiqueId}`);
  return verifier(r, 'Impossible de récupérer les boosts').boosts || [];
}

export async function getDetailBoost(boostId: number): Promise<DetailBoost> {
  const r = await api.get<Reponse<DetailBoost>>(`/boosts/${boostId}`);
  return verifier(r, 'Boost introuvable');
}

export async function creerBrouillonBoost(boutiqueId: number, donnees: DonneesBrouillonBoost): Promise<Boost> {
  const r = await api.post<Reponse<{ boost: Boost }>>('/boosts', { boutique_id: boutiqueId, ...donnees });
  return verifier(r, 'Impossible de créer le brouillon').boost;
}

export async function demanderUrlVideo(
  boutiqueId: number,
  contentType: string,
  taille: number
): Promise<{ upload_url: string; url: string; path: string; expire_en_sec: number }> {
  const r = await api.post<
    Reponse<{ upload_url: string; url: string; path: string; expire_en_sec: number }>
  >('/boosts/video/upload-url', { boutique_id: boutiqueId, content_type: contentType, taille });
  return verifier(r, "Impossible de préparer l'envoi de la vidéo");
}

/** PUT présigné vers R2, avec progression (0–100). */
export function televerserVideo(
  uploadUrl: string,
  fichier: File,
  onProgress?: (pourcent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', fichier.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Envoi de la vidéo impossible"));
    };
    xhr.onerror = () => reject(new Error("Envoi de la vidéo impossible"));
    xhr.send(fichier);
  });
}

export async function enregistrerBrouillonBoost(boostId: number, donnees: DonneesBrouillonBoost): Promise<Boost> {
  const r = await api.put<Reponse<{ boost: Boost }>>(`/boosts/${boostId}`, donnees);
  return verifier(r, "Impossible d'enregistrer le brouillon").boost;
}

export async function supprimerBrouillonBoost(boostId: number): Promise<void> {
  verifier(await api.delete<Reponse<object>>(`/boosts/${boostId}`), 'Impossible de supprimer le brouillon');
}

export async function soumettreBoost(boostId: number): Promise<Boost> {
  const r = await api.post<Reponse<{ boost: Boost }>>(`/boosts/${boostId}/soumettre`, {});
  return verifier(r, 'Soumission impossible').boost;
}

export async function annulerSoumissionBoost(boostId: number): Promise<Boost> {
  const r = await api.post<Reponse<{ boost: Boost }>>(`/boosts/${boostId}/annuler-soumission`, {});
  return verifier(r, 'Impossible de revenir au brouillon').boost;
}

export interface DemandePaiementBoost {
  mode: 'mobile' | 'carte';
  operateur?: 'airtelmoney' | 'moovmoney';
  msisdn?: string;
  return_url?: string;
}

export async function payerBoost(
  boostId: number,
  demande: DemandePaiementBoost
): Promise<{ bill_id: string; transaction_id: number; redirect?: boolean; url?: string; message?: string }> {
  const r = await api.post<Reponse<{ bill_id: string; transaction_id: number; redirect?: boolean; url?: string }>>(
    `/boosts/${boostId}/paiement`,
    demande
  );
  return verifier(r, "Impossible d'initier le paiement");
}

export async function mettreEnPauseBoost(boostId: number): Promise<Boost> {
  const r = await api.post<Reponse<{ boost: Boost }>>(`/boosts/${boostId}/pause`, {});
  return verifier(r, 'Mise en pause impossible').boost;
}

export async function reprendreBoost(boostId: number): Promise<Boost> {
  const r = await api.post<Reponse<{ boost: Boost }>>(`/boosts/${boostId}/reprendre`, {});
  return verifier(r, 'Reprise impossible').boost;
}

async function requetePubliqueRelances<T>(chemin: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${chemin}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const data = (await response.json().catch(() => null)) as (T & { success?: boolean; message?: string }) | null;
  if (!response.ok) {
    throw new ApiError(data?.message || `Erreur HTTP ${response.status}`, response.status, data);
  }
  return data as T;
}

export async function getDesinscriptionRelances(jeton: string): Promise<{ desinscrit: boolean; boutique?: string }> {
  const r = await requetePubliqueRelances<Reponse<{ desinscrit: boolean; boutique?: string }>>(
    `/boosts/relances/desinscription?jeton=${encodeURIComponent(jeton)}`
  );
  const ok = verifier(r, 'Lien de désinscription invalide');
  return { desinscrit: ok.desinscrit, boutique: ok.boutique };
}

export async function majDesinscriptionRelances(jeton: string, desinscrit: boolean): Promise<boolean> {
  const r = await requetePubliqueRelances<Reponse<{ desinscrit: boolean }>>('/boosts/relances/desinscription', {
    method: 'POST',
    body: JSON.stringify({ jeton, desinscrit }),
  });
  return verifier(r, 'Impossible de mettre à jour la désinscription').desinscrit;
}

export async function getPreferencesRelances(): Promise<boolean> {
  const r = await api.get<Reponse<{ preferences: { relances_boost: boolean } }>>('/boosts/relances/preferences');
  return verifier(r, 'Impossible de lire les préférences').preferences.relances_boost;
}

export async function majPreferencesRelances(relancesBoost: boolean): Promise<boolean> {
  const r = await api.put<Reponse<{ preferences: { relances_boost: boolean } }>>('/boosts/relances/preferences', {
    relances_boost: relancesBoost
  });
  return verifier(r, 'Impossible d’enregistrer les préférences').preferences.relances_boost;
}

/** Plancher de budget média par jour, identique pour tous les objectifs (miroir de budgetJourMinimum côté API). */
export function budgetJourMinimum(parametres: ParametresBoost): number {
  return Math.max(parametres.budget_jour_min_fcfa, parametres.budget_jour_min_meta_fcfa ?? parametres.budget_jour_min_whatsapp_fcfa ?? 0);
}

/** Frais fixe applicable au visuel choisi : seulement pour une vidéo (miroir de fraisVideoPour côté API). */
export function fraisVideoPour(mediaType: 'image' | 'video' | null | undefined, parametres: ParametresBoost): number {
  return mediaType === 'video' ? Math.max(0, parametres.frais_video_fcfa ?? 0) : 0;
}

/** Budget média d'un total payé (miroir de devisDepuisTotal côté API, pour signaler les packs insuffisants). */
export function budgetMediaDepuisTotal(totalFcfa: number, parametres: ParametresBoost, fraisVideoFcfa = 0): number {
  const baseHt = Math.round((totalFcfa * 10_000) / (10_000 + parametres.tva_bps));
  const net = baseHt - Math.max(0, fraisVideoFcfa);
  const commission = Math.max(parametres.commission_min_fcfa, Math.round((net * parametres.commission_bps) / (10_000 + parametres.commission_bps)));
  return Math.max(0, net - commission);
}

export function formaterFcfa(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(montant))} FCFA`;
}

export function formaterNombre(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}
