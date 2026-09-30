import { api } from '@/lib/api';

export interface ParticipantBillet {
  id: number;
  numero: number;
  type_billet: string;
  jeton: string;
  scanne_le: string | null;
  date_creation: string;
  commande_id: number;
  numero_commande: string;
  client_nom: string;
  client_email: string | null;
  client_telephone: string;
  statut_paiement: string;
  date_commande: string;
}

export interface StatsEvenement {
  billets_vendus: number;
  billets_scannes: number;
  revenus: number;
  /** Billets émis par type de billet (clé = nom du billet). */
  ventes_par_type: Record<string, number>;
}

interface ParticipantsResponse {
  success: boolean;
  message?: string;
  participants: ParticipantBillet[];
  stats: StatsEvenement;
}

/**
 * Billets émis pour un événement du vendeur, avec l'acheteur et le statut de scan.
 */
export async function getParticipantsEvenement(
  produitId: number
): Promise<{ participants: ParticipantBillet[]; stats: StatsEvenement }> {
  const response = await api.get<ParticipantsResponse>(`/produits/${produitId}/participants`);
  if (!response.success) {
    throw new Error(response.message || 'Impossible de récupérer les participants');
  }
  return { participants: response.participants || [], stats: response.stats };
}

/**
 * Marque un billet comme scanné (contrôlé à l'entrée) ou annule le scan.
 */
export async function marquerBilletScanne(
  billetId: number,
  scanne: boolean
): Promise<{ id: number; scanne_le: string | null }> {
  const response = await api.patch<{
    success: boolean;
    message?: string;
    billet: { id: number; scanne_le: string | null };
  }>(`/billets/${billetId}/scan`, { scanne });
  if (!response.success) {
    throw new Error(response.message || 'Impossible de mettre à jour le billet');
  }
  return response.billet;
}

/**
 * Renvoie à l'acheteur l'email de ses billets (même email qu'à l'achat).
 */
export async function renvoyerEmailBillets(commandeId: number): Promise<string> {
  const response = await api.post<{ success: boolean; message?: string }>(
    `/billets/commande/${commandeId}/renvoyer-email`,
    {}
  );
  if (!response.success) {
    throw new Error(response.message || "Impossible de renvoyer l'email");
  }
  return response.message || 'Email renvoyé';
}
