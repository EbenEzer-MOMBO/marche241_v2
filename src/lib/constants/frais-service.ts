/**
 * Frais de service Marché 241 ajoutés au paiement de l'acheteur (10 %).
 * Doit rester aligné sur `FRAIS_SERVICE_POURCENTAGE` de l'API
 * (marche241-api/src/controllers/paiement.controller.ts) et sur OrderSummary.
 */
export const FRAIS_SERVICE_POURCENTAGE = 0.1;

/** Montant payé par l'acheteur pour un prix vendeur donné (arrondi comme côté serveur). */
export const prixAvecFraisService = (montant: number): number =>
  Math.round(montant * (1 + FRAIS_SERVICE_POURCENTAGE));
