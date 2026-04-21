export type MobileMoneyOperator = 'moov' | 'airtel';

/** Chiffres uniquement, max 9 (comportement identique au checkout OrderSummary). */
export function normalizeMsisdnInput(value: string): string {
  return value.replace(/[^\d]/g, '').slice(0, 9);
}

export function msisdnPlaceholder(operator: MobileMoneyOperator): string {
  return operator === 'moov' ? '06XXXXXXX' : '07XXXXXXX';
}

/**
 * Valide un MSISDN Gabon pour Moov (06…) ou Airtel (07…).
 * Retourne une chaîne d’erreur ou '' si valide / si la saisie est vide (pas d’erreur tant que vide).
 */
export function validateMsisdn(phone: string, operator: MobileMoneyOperator): string {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[^\d+]/g, '');

  if (operator === 'moov') {
    if (!/^06\d{7}$/.test(cleanPhone)) {
      return 'Le numéro Moov Money doit respecter le format 06XXXXXXX (9 chiffres)';
    }
  } else if (operator === 'airtel') {
    if (!/^07\d{7}$/.test(cleanPhone)) {
      return 'Le numéro Airtel Money doit respecter le format 07XXXXXXX (9 chiffres)';
    }
  }

  return '';
}
