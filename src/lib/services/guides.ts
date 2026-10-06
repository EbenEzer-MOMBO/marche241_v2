/**
 * Visites guidées de l'espace vendeur (terminées ou passées), enregistrées par l'API.
 * Routes : GET /vendeurs/me/guides, PUT /vendeurs/me/guides/:guide (cf. marche241-api/src/routes/vendeur.routes.ts).
 */

import api from '@/lib/api';
import type { StatutGuideVendeur } from '@/lib/database-types';

export type CodeGuide = 'publicite';

export type EtatGuides = Partial<Record<CodeGuide, { statut: StatutGuideVendeur; date_modification: string }>>;

export async function getGuides(): Promise<EtatGuides> {
  const r = await api.get<{ success: boolean; message?: string; guides?: EtatGuides }>('/vendeurs/me/guides');
  if (!r.success) throw new Error(r.message || 'Visites guidées indisponibles');
  return r.guides ?? {};
}

export async function enregistrerGuide(guide: CodeGuide, statut: StatutGuideVendeur): Promise<void> {
  const r = await api.put<{ success: boolean; message?: string }>(`/vendeurs/me/guides/${guide}`, { statut });
  if (!r.success) throw new Error(r.message || "Impossible d'enregistrer la visite guidée");
}
