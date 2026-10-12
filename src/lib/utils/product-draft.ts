/**
 * Sauvegarde du brouillon des formulaires produit dans localStorage.
 *
 * Les images ajoutées sont des data URLs base64 (plusieurs Mo chacune) : les
 * stocker dépasse vite le quota (~5 Mo sur Safari iOS) et lève une
 * QuotaExceededError (Sentry MARCHE241-FRONTEND-G). On ne garde donc que les
 * URLs déjà hébergées, et toute erreur de stockage est ignorée (le dernier
 * brouillon enregistré est conservé) : le brouillon est un confort, il ne doit
 * jamais casser le formulaire.
 */

import { ecrireStockageLocal } from './stockage-local';

export const MESSAGE_CHARGER_BROUILLON =
  'Un brouillon a été trouvé. Voulez-vous le charger ?\n\n' +
  'Les photos qui n’avaient pas encore été envoyées devront être ajoutées à nouveau.';

const estDataUrl = (valeur: unknown): boolean =>
  typeof valeur === 'string' && valeur.startsWith('data:');

export function sauvegarderBrouillonProduit<T extends { images: string[] }>(cle: string, formData: T): void {
  const brouillon = { ...formData, images: formData.images.filter((img) => !estDataUrl(img)) };
  // Retire aussi les data URLs imbriquées (ex. image d'une variante).
  const json = JSON.stringify(brouillon, (_cle, valeur) => (estDataUrl(valeur) ? undefined : valeur));
  // En cas d'échec (stockage plein ou indisponible), le dernier brouillon enregistré est conservé.
  ecrireStockageLocal(cle, json);
}
