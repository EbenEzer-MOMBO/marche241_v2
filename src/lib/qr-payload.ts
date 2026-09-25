export function ticketQrPayload(jeton: string, numero: number): string {
  return `M241|${jeton}|${numero}`;
}

export function formatTicketNumero(numero: number): string {
  if (!Number.isFinite(numero) || numero < 1) {
    return String(numero);
  }
  return String(Math.trunc(numero)).padStart(4, '0');
}
