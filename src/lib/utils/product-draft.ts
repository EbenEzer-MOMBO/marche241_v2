/**
 * Sauvegarde du brouillon des formulaires produit dans localStorage.
 *
 * Les images ajoutées sont des data URLs base64 (plusieurs Mo chacune) : les
 * stocker dépasse vite le quota (~5 Mo sur Safari iOS) et lève une
 * QuotaExceededError (Sentry MARCHE241-FRONTEND-G). On ne garde donc que les
 * URLs déjà hébergées, et toute erreur de stockage est ignorée : le brouillon
 * est un confort, il ne doit jamais casser le formulaire.
 */

const estDataUrl = (valeur: unknown): boolean =>
  typeof valeur === 'string' && valeur.startsWith('data:');

export function sauvegarderBrouillonProduit<T extends { images: string[] }>(cle: string, formData: T): void {
  try {
    const brouillon = { ...formData, images: formData.images.filter((img) => !estDataUrl(img)) };
    // Retire aussi les data URLs imbriquées (ex. image d'une variante).
    const json = JSON.stringify(brouillon, (_cle, valeur) => (estDataUrl(valeur) ? undefined : valeur));
    localStorage.setItem(cle, json);
  } catch {
    try {
      localStorage.removeItem(cle);
    } catch {
      // Stockage indisponible (navigation privée, quota) : on abandonne le brouillon.
    }
  }
}
