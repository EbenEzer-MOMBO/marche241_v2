/**
 * Service billetterie publique : événements à venir de toutes les boutiques
 * (GET /produits?type_vente=evenement), mis en forme pour l'accueil et /evenements.
 */

import type { ProduitDB } from '@/lib/database-types';
import { getProduitsMarketplace } from '@/lib/services/products';

/** Plafond de la validation Joi de l'API (`limite` ≤ 100). */
const LIMITE_EVENEMENTS = 100;

/** Seuil sous lequel on affiche « Plus que N places ». */
const SEUIL_PLACES_RESTANTES = 20;

export type CategorieEvenement = 'concert' | 'soiree' | 'salon' | 'spectacle';

export const LIBELLES_CATEGORIE_EVENEMENT: Record<CategorieEvenement, string> = {
  concert: 'Concert',
  soiree: 'Soirée',
  salon: 'Salon',
  spectacle: 'Spectacle',
};

/**
 * Les événements n'ont pas encore de type en base : la catégorie est déduite
 * de mots-clés du nom et de la description (premier motif trouvé).
 */
const MOTIFS_CATEGORIE: Array<[CategorieEvenement, RegExp]> = [
  ['salon', /\b(salon|forum|conf[ée]rence|s[ée]minaire|atelier|foire|expo(sition)?|masterclass)\b/i],
  ['spectacle', /\b(spectacle|com[ée]die|comedy|humour|stand.?up|th[ée][âa]tre|d[ée]fil[ée])\b/i],
  ['concert', /\b(concert|live|acoustique|festival|showcase|chorale|gospel)\b/i],
  ['soiree', /\b(soir[ée]e|nuit|night|party|f[êe]te|gala|dj|club|brunch)\b/i],
];

export interface TarifEvenement {
  nom: string;
  prix: number;
}

export interface EvenementPublic {
  id: number;
  nom: string;
  href: string;
  image?: string;
  date: Date;
  /** Bloc date : « 10 » */
  jour: string;
  /** Bloc date : « oct » */
  mois: string;
  /** « Sam. · 21:00 » */
  quand: string;
  /** « Samedi 10 octobre · 21:00 » */
  dateLongue: string;
  lieu?: string;
  organisateur?: string;
  categorie?: CategorieEvenement;
  prixMin: number;
  gratuit: boolean;
  tarifs: TarifEvenement[];
  placesRestantes?: number;
  complet: boolean;
  misEnAvant: boolean;
}

type BilletVariant = { nom?: unknown; prix?: unknown; prix_promo?: unknown; stock?: unknown };

const enMajuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

const formatHeure = (date: Date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const prixBillet = (billet: BilletVariant): number => {
  const promo = Number(billet.prix_promo);
  if (Number.isFinite(promo) && promo > 0) return promo;
  const prix = Number(billet.prix);
  return Number.isFinite(prix) ? prix : 0;
};

const deduireCategorie = (produit: ProduitDB): CategorieEvenement | undefined => {
  const texte = `${produit.nom} ${produit.description ?? ''}`;
  return MOTIFS_CATEGORIE.find(([, motif]) => motif.test(texte))?.[0];
};

/**
 * Convertit un produit événement en données d'affichage.
 * Retourne null si l'événement n'a pas de date valide ou si sa boutique est inconnue.
 */
export function toEvenementPublic(produit: ProduitDB): EvenementPublic | null {
  const bag = (produit.variants && typeof produit.variants === 'object' ? produit.variants : {}) as {
    meta?: Record<string, unknown>;
    variants?: BilletVariant[];
  };
  const meta = bag.meta ?? {};
  const date = typeof meta.date_debut === 'string' ? new Date(meta.date_debut) : null;
  const slugBoutique = produit.boutique?.slug;
  if (!date || Number.isNaN(date.getTime()) || !slugBoutique) return null;

  const billets = Array.isArray(bag.variants) ? bag.variants : [];
  const tarifs = billets
    .map((billet) => ({ nom: String(billet.nom ?? '').trim(), prix: prixBillet(billet) }))
    .filter((tarif) => tarif.nom);
  const prixMin = tarifs.length
    ? Math.min(...tarifs.map((tarif) => tarif.prix))
    : produit.prix_promo ?? produit.prix ?? 0;

  const places = billets.reduce((somme, billet) => somme + (Number(billet.stock) || 0), 0);
  const complet = produit.en_stock === false || (billets.length > 0 && places <= 0);

  const jourSemaine = date.toLocaleDateString('fr-FR', { weekday: 'short' });

  return {
    id: produit.id,
    nom: produit.nom,
    href: `/${slugBoutique}/produit/${produit.id}`,
    image: produit.image_principale || produit.images?.[0] || undefined,
    date,
    jour: date.toLocaleDateString('fr-FR', { day: '2-digit' }),
    mois: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    quand: `${enMajuscule(jourSemaine)} · ${formatHeure(date)}`,
    dateLongue: `${enMajuscule(
      date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    )} · ${formatHeure(date)}`,
    lieu: typeof meta.lieu === 'string' && meta.lieu.trim() ? meta.lieu.trim() : undefined,
    organisateur: produit.boutique?.nom,
    categorie: deduireCategorie(produit),
    prixMin,
    gratuit: prixMin <= 0,
    tarifs,
    placesRestantes:
      !complet && places > 0 && places <= SEUIL_PLACES_RESTANTES ? places : undefined,
    complet,
    misEnAvant: Boolean(produit.est_featured),
  };
}

/** « 5 000 FCFA » ou « Gratuit ». */
export function formatPrixEvenement(prix: number): string {
  if (prix <= 0) return 'Gratuit';
  return `${new Intl.NumberFormat('fr-FR').format(prix).replace(/ | /g, ' ')} FCFA`;
}

/** Vendredi 18h → dimanche 23h59 du week-end en cours (ou du prochain). */
export function estCeWeekEnd(date: Date, maintenant = new Date()): boolean {
  const jour = maintenant.getDay(); // 0 = dimanche
  const debut = new Date(maintenant);
  debut.setHours(0, 0, 0, 0);
  debut.setDate(debut.getDate() + (jour === 0 ? -2 : 5 - jour));
  debut.setHours(18, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 2);
  fin.setHours(23, 59, 59, 999);
  return date >= debut && date <= fin;
}

/**
 * Événements publiés dont la date n'est pas passée, triés du plus proche au plus lointain.
 */
export async function getEvenementsAVenir(): Promise<EvenementPublic[]> {
  const response = await getProduitsMarketplace({
    type_vente: 'evenement',
    limite: LIMITE_EVENEMENTS,
  });

  const debutDuJour = new Date();
  debutDuJour.setHours(0, 0, 0, 0);

  return (response.donnees || [])
    .map(toEvenementPublic)
    .filter((evenement): evenement is EvenementPublic => evenement !== null)
    .filter((evenement) => evenement.date >= debutDuJour)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
