import type { StatutBoost } from '@/lib/database-types';

export const STATUTS_BOOST: Record<StatutBoost, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  en_attente_paiement: { label: 'En attente de paiement', className: 'bg-yellow-100 text-yellow-800' },
  en_attente_validation: { label: 'En cours de validation', className: 'bg-amber-100 text-amber-800' },
  refuse: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
  actif: { label: 'En diffusion', className: 'bg-green-100 text-green-800' },
  en_pause: { label: 'En pause', className: 'bg-blue-100 text-blue-800' },
  termine: { label: 'Terminé', className: 'bg-gray-100 text-gray-600' },
  rejete_meta: { label: 'Refusé par Meta', className: 'bg-red-100 text-red-700' },
  erreur: { label: 'En cours de validation', className: 'bg-amber-100 text-amber-800' }
};

/** Badge de statut. `erreur` (incident de publication côté équipe) est présenté au vendeur comme une validation en cours. */
export default function StatutBoostBadge({ statut }: { statut: StatutBoost }) {
  const s = STATUTS_BOOST[statut] ?? STATUTS_BOOST.brouillon;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${s.className}`}>{s.label}</span>;
}
