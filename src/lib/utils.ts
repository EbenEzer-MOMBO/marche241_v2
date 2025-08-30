/**
 * Formate un prix en FCFA avec un formatage cohérent
 * @param price - Le prix à formater
 * @returns Le prix formaté avec FCFA
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param number - Le nombre à formater
 * @returns Le nombre formaté
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR').format(number);
}