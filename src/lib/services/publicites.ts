/**
 * Publicité interne (bannières sponsorisées sur les pages publiques Marché 241).
 * Routes API : /mises-en-avant (cf. marche241-api/src/routes/publicite.routes.ts, docs/PUBLICITE_INTERNE.md).
 * Ne jamais appeler /publicites depuis le navigateur : les bloqueurs de pub (Liste FR) bloquent les URL
 * contenant /publicites/, ce qui casse la page Publicité et les bannières chez les visiteurs équipés.
 */

import api from '@/lib/api';
import config from '@/lib/config';
import type {
  BannierePubliciteDiffusee,
  CibleTypePublicite,
  CreneauPublicite,
  DisponibiliteSemaine,
  FormulePublicite,
  PagePublicite,
  Publicite,
  PubliciteEvenement,
  StatsPublicite,
  StatutPublicite
} from '@/lib/database-types';

type Reponse<T> = { success: boolean; message?: string } & T;

function verifier<T extends { success: boolean; message?: string }>(r: T, defaut: string): T {
  if (!r.success) throw new Error(r.message || defaut);
  return r;
}

// ---------------------------------------------------------------- Public : diffusion et mesure

/** Bannières de la page (semaine en cours). Ne lève jamais : une erreur = aucune bannière. */
export async function getBannieresPage(page: PagePublicite, categorieId?: number | null): Promise<BannierePubliciteDiffusee[]> {
  try {
    const query = `page=${page}${categorieId ? `&categorie_id=${categorieId}` : ''}`;
    const r = await api.get<Reponse<{ bannieres: BannierePubliciteDiffusee[] }>>(`/mises-en-avant/diffusion?${query}`);
    return r.success ? r.bannieres ?? [] : [];
  } catch {
    return [];
  }
}

/** URL de clic : l'API compte le clic puis redirige vers le lien enregistré de la bannière. */
export function urlClicBanniere(id: number, page: PagePublicite): string {
  return `${config.apiBaseUrl}/mises-en-avant/${id}/clic?page=${page}`;
}

/** Signale un affichage (sans attendre la réponse, sans jamais lever). */
export function signalerAffichageBanniere(id: number, page: PagePublicite): void {
  try {
    const jeton = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    void fetch(`${config.apiBaseUrl}/mises-en-avant/${id}/affichage`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}) },
      body: JSON.stringify({ page })
    }).catch(() => undefined);
  } catch {
    // mesure facultative
  }
}

// ---------------------------------------------------------------- Vendeur

export interface FormulePubliciteInfo {
  code: FormulePublicite;
  nom: string;
  creneaux: CreneauPublicite[];
  prix_semaine_fcfa: number;
}

export interface FormatsVisuel {
  desktop: { largeur: number; hauteur: number; obligatoire: boolean };
  mobile: { largeur: number; hauteur: number; obligatoire: boolean };
  formats: string[];
  poids_max_mo: number;
}

export interface ParametresPubliciteVendeur {
  tarifs: Record<FormulePublicite, number>;
  remise_4_pour_3: boolean;
  semaines_max: number;
  semaines_avance_max: number;
  garantie_affichages: Record<FormulePublicite, number>;
  frais_encaissement_bps: number;
  plateforme_active: boolean;
  kill_switch: boolean;
  formules: FormulePubliciteInfo[];
  formats_visuel: FormatsVisuel;
  statuts: Record<StatutPublicite, string>;
  eligibilite: { eligible: boolean; raison: string | null } | null;
}

export interface DevisPublicite {
  formule: FormulePublicite;
  nb_semaines: number;
  prix_semaine_fcfa: number;
  semaines_offertes_remise: number;
  sous_total_fcfa: number;
  remise_fcfa: number;
  frais_encaissement_fcfa: number;
  total_fcfa: number;
}

export interface DonneesBrouillonPublicite {
  formule?: FormulePublicite;
  categorie_id?: number | null;
  semaine_debut?: string | null;
  nb_semaines?: number;
  image_url?: string | null;
  image_mobile_url?: string | null;
  texte_alternatif?: string | null;
  cible_type?: CibleTypePublicite;
  produit_id?: number | null;
}

export type PubliciteListe = Publicite & { totaux: { affichages: number; clics: number } };

export interface GarantiePublicite {
  seuil_par_semaine: number;
  seuil_total: number;
  atteint: boolean;
  semaines_payees: number;
}

export interface DetailPublicite {
  publicite: Publicite;
  stats: StatsPublicite;
  semaines: string[];
  garantie: GarantiePublicite;
  evenements: PubliciteEvenement[];
}

export async function getParametresPublicite(boutiqueId: number): Promise<ParametresPubliciteVendeur> {
  const r = await api.get<Reponse<{ parametres: ParametresPubliciteVendeur }>>(`/mises-en-avant/parametres?boutique_id=${boutiqueId}`);
  return verifier(r, 'Paramètres de publicité indisponibles').parametres;
}

export async function getDisponibilitesPublicite(
  formule: FormulePublicite,
  categorieId: number | null,
  exclureId?: number | null
): Promise<DisponibiliteSemaine[]> {
  const query = new URLSearchParams({ formule });
  if (categorieId) query.set('categorie_id', String(categorieId));
  if (exclureId) query.set('exclure_id', String(exclureId));
  const r = await api.get<Reponse<{ disponibilites: DisponibiliteSemaine[] }>>(`/mises-en-avant/disponibilites?${query.toString()}`);
  return verifier(r, 'Disponibilités indisponibles').disponibilites;
}

export async function getDevisPublicite(formule: FormulePublicite, nbSemaines: number): Promise<DevisPublicite> {
  const r = await api.post<Reponse<{ devis: DevisPublicite }>>('/mises-en-avant/devis', { formule, nb_semaines: nbSemaines });
  return verifier(r, 'Devis indisponible').devis;
}

export async function getPublicitesBoutique(boutiqueId: number): Promise<PubliciteListe[]> {
  const r = await api.get<Reponse<{ publicites: PubliciteListe[] }>>(`/mises-en-avant/boutique/${boutiqueId}`);
  return verifier(r, 'Impossible de récupérer les bannières').publicites || [];
}

export async function getDetailPublicite(id: number): Promise<DetailPublicite> {
  const r = await api.get<Reponse<DetailPublicite>>(`/mises-en-avant/${id}`);
  return verifier(r, 'Bannière introuvable');
}

export async function creerBrouillonPublicite(boutiqueId: number, donnees: DonneesBrouillonPublicite): Promise<Publicite> {
  const r = await api.post<Reponse<{ publicite: Publicite }>>('/mises-en-avant', { boutique_id: boutiqueId, ...donnees });
  return verifier(r, 'Impossible de créer le brouillon').publicite;
}

export async function enregistrerBrouillonPublicite(id: number, donnees: DonneesBrouillonPublicite): Promise<Publicite> {
  const r = await api.put<Reponse<{ publicite: Publicite }>>(`/mises-en-avant/${id}`, donnees);
  return verifier(r, "Impossible d'enregistrer le brouillon").publicite;
}

export async function supprimerBrouillonPublicite(id: number): Promise<void> {
  verifier(await api.delete<Reponse<object>>(`/mises-en-avant/${id}`), 'Impossible de supprimer le brouillon');
}

export async function soumettrePublicite(id: number): Promise<Publicite> {
  const r = await api.post<Reponse<{ publicite: Publicite }>>(`/mises-en-avant/${id}/soumettre`, {});
  return verifier(r, 'Réservation impossible').publicite;
}

export async function annulerSoumissionPublicite(id: number): Promise<Publicite> {
  const r = await api.post<Reponse<{ publicite: Publicite }>>(`/mises-en-avant/${id}/annuler-soumission`, {});
  return verifier(r, 'Impossible de revenir au brouillon').publicite;
}

export async function payerPublicite(
  id: number,
  demande: { mode: 'mobile' | 'carte'; operateur?: 'airtelmoney' | 'moovmoney'; msisdn?: string; return_url?: string }
): Promise<{ bill_id: string; transaction_id: number; redirect?: boolean; url?: string; message?: string }> {
  const r = await api.post<Reponse<{ bill_id: string; transaction_id: number; redirect?: boolean; url?: string }>>(`/mises-en-avant/${id}/paiement`, demande);
  return verifier(r, "Impossible d'initier le paiement");
}

// ---------------------------------------------------------------- Affichage

export const LIBELLES_FORMULE: Record<FormulePublicite, string> = {
  categorie: 'Catégorie',
  accueil: 'Accueil',
  premium: 'Premium'
};

export const DESCRIPTIONS_FORMULE: Record<FormulePublicite, string[]> = {
  categorie: ['Bannière en tête d\'une catégorie de produits', 'Visiteurs qui cherchent déjà ce type d\'article'],
  accueil: ['Bannière sur la page d\'accueil, sous la présentation', 'Seul annonceur de la semaine sur l\'accueil'],
  premium: ['Accueil + bandeau sur toutes les pages publiques', '1 publication sur les réseaux sociaux Marché 241']
};

export const LIBELLES_STATUT_PUBLICITE: Record<StatutPublicite, string> = {
  brouillon: 'Brouillon',
  en_attente_paiement: 'En attente de paiement',
  en_attente_validation: 'En attente de validation',
  refusee: 'Refusée',
  programmee: 'Programmée',
  active: 'En diffusion',
  terminee: 'Terminée',
  annulee: 'Annulée'
};

/** « 12 oct. » à partir d'un lundi AAAA-MM-JJ (sans décalage de fuseau). */
export function formaterJour(jour: string, avecAnnee = false): string {
  const date = new Date(`${jour}T12:00:00Z`);
  return date.toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'short', ...(avecAnnee ? { year: 'numeric' } : {}) });
}

/** Dimanche d'une semaine commençant le lundi `jour`. */
export function dimancheDe(jour: string): string {
  const date = new Date(`${jour}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().slice(0, 10);
}

/** « 12 oct. → 25 oct. 2026 » pour `nb` semaines à partir du lundi `jour`. */
export function libellePeriodePublicite(jour: string, nb: number): string {
  const fin = new Date(`${jour}T12:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() + nb * 7 - 1);
  return `${formaterJour(jour)} → ${formaterJour(fin.toISOString().slice(0, 10), true)}`;
}
