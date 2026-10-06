/**
 * Boost publicitaire Meta Ads (Facebook & Instagram) — espace vendeur.
 * Routes API : /boosts (cf. marche241-api/src/routes/boost.routes.ts).
 */

import api, { ApiError } from '@/lib/api';
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
  budget_jour_min_fcfa: number;
  packs: PackBoost[];
  kill_switch: boolean;
  /** Types de publicité disponibles : la mise en avant plateforme n'est pas encore ouverte. */
  types: { plateforme: boolean; meta: boolean };
  durees: number[];
  pays: OptionCiblage[];
  villes: Array<{ cle: string; nom: string }>;
  langues: Array<{ locale: string; nom: string }>;
  interets: OptionCiblage[];
  statuts: Record<StatutBoost, string>;
  mode_simule: boolean;
}

export interface DevisBoost {
  budget_media_fcfa: number;
  commission_bps: number;
  commission_fcfa: number;
  tva_bps: number;
  tva_fcfa: number;
  total_fcfa: number;
  duree_jours: number;
  budget_jour_fcfa: number;
  /** Part du total retenue en cas de remboursement (frais eBilling). */
  frais_encaissement_fcfa: number;
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

export async function getDevisBoost(totalFcfa: number, dureeJours: number): Promise<DevisBoost> {
  const r = await api.post<Reponse<{ devis: DevisBoost }>>('/boosts/devis', { total_fcfa: totalFcfa, duree_jours: dureeJours });
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

export async function estimerImpressionsBoost(totauxFcfa: number[], dureeJours: number): Promise<EstimationImpressions[]> {
  const r = await api.post<Reponse<{ impressions: EstimationImpressions[] }>>('/boosts/estimation/impressions', {
    totaux_fcfa: totauxFcfa,
    duree_jours: dureeJours
  });
  return verifier(r, 'Estimation indisponible').impressions;
}

export async function getBoostsBoutique(boutiqueId: number): Promise<Boost[]> {
  const r = await api.get<Reponse<{ boosts: Boost[] }>>(`/boosts/boutique/${boutiqueId}`);
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

export function formaterFcfa(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(montant))} FCFA`;
}

export function formaterNombre(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n));
}
