/**
 * Construction des liens WhatsApp vendeur (numéros gabonais).
 */

/**
 * Normalise un numéro local ou international vers le format wa.me (indicatif 241).
 */
export const normalizeGabonPhone = (
  telephone?: string | null
): string | null => {
  if (!telephone) return null;
  const digits = telephone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  if (digits.startsWith('241')) return digits;
  return `241${digits.replace(/^0/, '')}`;
};

/**
 * Lien wa.me prérempli, ou null si le numéro vendeur est inexploitable.
 */
export const buildVendorWhatsAppUrl = (
  telephone: string | null | undefined,
  message: string
): string | null => {
  const phone = normalizeGabonPhone(telephone);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
