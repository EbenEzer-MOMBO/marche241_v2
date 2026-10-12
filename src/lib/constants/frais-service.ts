/**
 * Frais de service Marché 241 ajoutés au paiement de l'acheteur.
 *
 * Le taux est la marge personnalisée du vendeur, en % entier (10 à 50, 10 par défaut),
 * renvoyée par l'API dans `boutique.taux_marge` et figée sur chaque commande
 * (`commande.taux_marge`). Doit rester aligné sur `src/lib/marge/marge.ts` de l'API,
 * utilisé par verifierMontantTransaction (paiement.controller.ts).
 */
export const TAUX_MARGE_DEFAUT = 10;
const TAUX_MARGE_MIN = 10;
const TAUX_MARGE_MAX = 50;

/** Taux exploitable : entier dans les bornes, sinon le taux par défaut (valeur absente ou invalide). */
export const normaliserTauxMarge = (taux: unknown): number => {
  const valeur = typeof taux === 'string' ? Number(taux) : taux;
  if (typeof valeur !== 'number' || !Number.isInteger(valeur)) return TAUX_MARGE_DEFAUT;
  if (valeur < TAUX_MARGE_MIN || valeur > TAUX_MARGE_MAX) return TAUX_MARGE_DEFAUT;
  return valeur;
};

/** Frais de service sur un montant vendeur (arrondi comme côté serveur). */
export const fraisService = (montant: number, taux: number): number =>
  Math.round((montant * taux) / 100);

/** Montant payé par l'acheteur pour un prix vendeur donné. */
export const prixAvecFraisService = (montant: number, taux: number): number =>
  montant + fraisService(montant, taux);

/** Montant revenant au vendeur à partir d'un montant encaissé (frais de service inclus). */
export const montantNetVendeur = (montantBrut: number, taux: number): number =>
  Math.round((montantBrut * 100) / (100 + taux));
