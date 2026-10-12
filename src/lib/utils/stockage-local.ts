/**
 * Écriture tolérante dans localStorage.
 *
 * `setItem` lève une exception quand le quota est atteint (QuotaExceededError,
 * ~5 Mo sur Safari iOS) ou quand le stockage est bloqué. Le localStorage ne sert
 * que de cache côté client : un échec ne doit jamais interrompre l'action en
 * cours (connexion, création de boutique, mise à jour du profil…).
 *
 * En cas d'échec, l'ancienne valeur est retirée pour ne pas relire une donnée
 * périmée (ancienne boutique, ancien profil), sauf si `conserverAncienne` est
 * demandé (ex. brouillon : mieux vaut l'avant-dernière version que rien).
 *
 * @returns `true` si la valeur a été enregistrée.
 */
export function ecrireStockageLocal(
  cle: string,
  valeur: string,
  { conserverAncienne = false }: { conserverAncienne?: boolean } = {},
): boolean {
  try {
    localStorage.setItem(cle, valeur);
    return true;
  } catch (erreur) {
    console.warn(`Stockage local indisponible pour « ${cle} »`, erreur);
    if (!conserverAncienne) {
      try {
        localStorage.removeItem(cle);
      } catch {
        // Stockage totalement inaccessible : rien de plus à faire.
      }
    }
    return false;
  }
}

/**
 * Lecture JSON tolérante depuis localStorage.
 *
 * @returns la valeur décodée, ou `null` si la clé est absente, illisible ou
 * corrompue (une valeur corrompue est retirée pour ne pas échouer à nouveau).
 */
export function lireJsonStockageLocal<T>(cle: string): T | null {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : null;
  } catch (erreur) {
    console.warn(`Valeur illisible dans le stockage local pour « ${cle} »`, erreur);
    try {
      localStorage.removeItem(cle);
    } catch {
      // Stockage totalement inaccessible : rien de plus à faire.
    }
    return null;
  }
}
