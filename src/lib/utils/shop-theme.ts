/**
 * Utilitaires thème storefront (variable vendeur --color-shop-primary).
 */

export const getRelativeLuminance = (hex: string): number => {
  const cleaned = hex.replace('#', '').trim();
  if (cleaned.length !== 6) return 0;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

/** Texte sur CTA plein : noir si luminance primaire > 0.7, sinon blanc. */
export const getCtaTextColor = (primaryHex?: string | null): string => {
  if (!primaryHex) return '#ffffff';
  return getRelativeLuminance(primaryHex) > 0.7 ? '#17181a' : '#ffffff';
};

export const formatPromoBadge = (
  prix: number,
  prixOriginal?: number | null
): string | null => {
  if (!prixOriginal || prixOriginal <= prix) return null;
  const pct = Math.round(((prixOriginal - prix) / prixOriginal) * 100);
  if (pct <= 0) return null;
  return `−${pct} %`;
};

export const formatLowStockLabel = (
  enStock: boolean,
  quantite?: number | null
): string | null => {
  if (!enStock) return null;
  if (typeof quantite !== 'number' || quantite <= 0 || quantite > 3) return null;
  return `Plus que ${quantite}`;
};

export const produitHasRequiredVariants = (variants?: unknown): boolean => {
  if (!variants) return false;
  if (typeof variants === 'string') {
    try {
      const parsed = JSON.parse(variants);
      return produitHasRequiredVariants(parsed);
    } catch {
      return false;
    }
  }
  if (Array.isArray(variants)) return variants.length > 0;
  if (typeof variants === 'object') {
    const values = Object.values(variants as Record<string, unknown>);
    if (values.length === 0) return false;
    // Schéma type { type, items } ou map d'options
    const typeField = (variants as { type?: string }).type;
    if (typeField === 'aucun' || typeField === 'none') return false;
    return true;
  }
  return false;
};

export type SalesFormat = 'Produit' | 'Événement' | 'Service';

export const resolveSalesFormat = (value?: string | null): SalesFormat => {
  if (value === 'Événement' || value === 'Evenement' || value === 'event') {
    return 'Événement';
  }
  if (value === 'Service' || value === 'service') return 'Service';
  return 'Produit';
};
