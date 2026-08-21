/**
 * Pastille couleur pour les pills de variante (échantillon intégré).
 */

const COLOR_HEX: Record<string, string> = {
  noir: '#17181a',
  black: '#17181a',
  blanc: '#f7f6f3',
  white: '#f7f6f3',
  gris: '#8b8f95',
  gray: '#8b8f95',
  grey: '#8b8f95',
  rouge: '#b3261e',
  red: '#b3261e',
  bleu: '#2f5fd8',
  blue: '#2f5fd8',
  marine: '#1e3a5f',
  vert: '#16a34a',
  green: '#16a34a',
  jaune: '#eab308',
  yellow: '#eab308',
  orange: '#ea580c',
  rose: '#ec4899',
  pink: '#ec4899',
  violet: '#7c3aed',
  purple: '#7c3aed',
  beige: '#d6c7a1',
  marron: '#7c4a32',
  brown: '#7c4a32',
  kaki: '#6b7346',
  crème: '#f3ead6',
  creme: '#f3ead6',
  bordeaux: '#7f1d1d',
};

/**
 * Retourne un hex pour un nom de couleur connu, sinon un gris neutre.
 */
export const getColorSwatch = (name: string): string => {
  const key = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return COLOR_HEX[key] ?? '#cfcbc3';
};
