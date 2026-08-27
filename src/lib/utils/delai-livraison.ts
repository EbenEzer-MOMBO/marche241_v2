/**
 * Formate un délai de livraison (exprimé en jours, min/max) de façon lisible.
 * ≤ 2 jours => converti en heures (24h, 24-48h, 48h) ; au-delà => affiché en jours (3-5 jours).
 */
export function formatDureeLivraison(minJours: number, maxJours: number): string {
  if (minJours === 0 && maxJours === 0) {
    return 'immédiate';
  }

  const enHeures = maxJours <= 2;
  const min = enHeures ? minJours * 24 : minJours;
  const max = enHeures ? maxJours * 24 : maxJours;
  const unite = enHeures ? 'h' : (max > 1 ? ' jours' : ' jour');

  if (minJours === 0 || min === max) {
    return `${max}${unite}`;
  }

  return `${min}-${max}${unite}`;
}

/** Variante phrase complète : "Livraison en 24-48h" / "Livraison immédiate". */
export function formatDelaiLivraison(minJours: number, maxJours: number): string {
  const duree = formatDureeLivraison(minJours, maxJours);
  return duree === 'immédiate' ? 'Livraison immédiate' : `Livraison en ${duree}`;
}
