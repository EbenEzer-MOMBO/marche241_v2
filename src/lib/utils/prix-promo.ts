/**
 * Prix et promotions des produits — règles uniques pour la saisie (dashboard vendeur) et l'affichage.
 *
 * Contrat d'ENVOI à l'API (création, modification, événements) : `prix` = prix NORMAL,
 * `prix_promo` = prix promotionnel ou `null`. L'API stocke ensuite `prix` = prix actif et
 * `prix_original` = prix normal ; à la LECTURE, `prix` est donc le prix payé et `prix_original`
 * le prix barré (présent uniquement pendant une promotion).
 */

export interface PrixAvecPromo {
  prix?: number | string | null;
  prix_promo?: number | string | null;
}

const nombre = (valeur: unknown): number => {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : 0;
};

/** Une promotion n'est valide que si 0 < prix promo < prix normal. */
export const promoValide = (prixNormal: unknown, prixPromo: unknown): boolean => {
  const promo = nombre(prixPromo);
  return promo > 0 && promo < nombre(prixNormal);
};

/** Affichage : le prix barré n'existe que s'il est strictement supérieur au prix payé. */
export const aPromotion = (prix: unknown, prixOriginal: unknown): boolean =>
  nombre(prixOriginal) > 0 && nombre(prixOriginal) > nombre(prix);

/** Prix payé pour une variante / un billet (promo valide prioritaire). */
export const prixEffectif = (variante: PrixAvecPromo): number =>
  promoValide(variante.prix, variante.prix_promo) ? nombre(variante.prix_promo) : nombre(variante.prix);

/** Prix barré d'une variante / d'un billet : son prix normal, uniquement si sa promo est valide. */
export const prixBarreVariante = (variante?: PrixAvecPromo | null): number | null =>
  variante && promoValide(variante.prix, variante.prix_promo) ? nombre(variante.prix) : null;

export interface PrixPourApi {
  /** Prix normal (contrat d'envoi). */
  prix: number;
  /** Prix promotionnel valide, sinon `null`. */
  prix_promo: number | null;
}

export interface SaisiePrixProduit {
  category?: string;
  /** Variantes (vêtements, chaussures, autres) ou billets (événement). */
  variants?: PrixAvecPromo[] | null;
  /** Produit sans variantes : prix saisi (service, générique). */
  prix?: number | string | null;
  prix_promo?: number | string | null;
  /** Service sur devis : pas de prix affiché. */
  sur_devis?: boolean;
}

/**
 * Prix à envoyer à l'API pour un produit saisi dans un formulaire.
 * Avec des variantes / billets, la référence est la moins chère en prix EFFECTIF (promo comprise).
 */
export function calculerPrixPourApi(saisie: SaisiePrixProduit): PrixPourApi {
  const avecVariantes =
    saisie.category === 'vetements' ||
    saisie.category === 'chaussures' ||
    saisie.category === 'autres' ||
    saisie.category === 'evenement';

  if (avecVariantes && Array.isArray(saisie.variants)) {
    const candidats = saisie.variants.filter((v) => nombre(v.prix) > 0);
    if (candidats.length === 0) return { prix: 0, prix_promo: null };
    const reference = candidats.reduce((min, v) => (prixEffectif(v) < prixEffectif(min) ? v : min));
    return {
      prix: nombre(reference.prix),
      prix_promo: promoValide(reference.prix, reference.prix_promo) ? nombre(reference.prix_promo) : null
    };
  }

  if (saisie.category === 'service') {
    const prix = saisie.sur_devis ? 0 : Math.trunc(nombre(saisie.prix));
    return { prix, prix_promo: promoValide(prix, saisie.prix_promo) ? nombre(saisie.prix_promo) : null };
  }

  return { prix: Math.trunc(nombre(saisie.prix)), prix_promo: null };
}
