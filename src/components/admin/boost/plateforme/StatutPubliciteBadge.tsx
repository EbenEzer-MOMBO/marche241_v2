import type { StatutPublicite } from '@/lib/database-types';

export const STATUTS_PUBLICITE: Record<StatutPublicite, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  en_attente_paiement: { label: 'En attente de paiement', className: 'bg-yellow-100 text-yellow-800' },
  en_attente_validation: { label: 'En cours de validation', className: 'bg-amber-100 text-amber-800' },
  refusee: { label: 'Refusée', className: 'bg-red-100 text-red-700' },
  programmee: { label: 'Programmée', className: 'bg-blue-100 text-blue-800' },
  active: { label: 'En diffusion', className: 'bg-green-100 text-green-800' },
  terminee: { label: 'Terminée', className: 'bg-gray-100 text-gray-600' },
  annulee: { label: 'Annulée', className: 'bg-red-50 text-red-700' }
};

export default function StatutPubliciteBadge({ statut }: { statut: StatutPublicite }) {
  const s = STATUTS_PUBLICITE[statut] ?? STATUTS_PUBLICITE.brouillon;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${s.className}`}>{s.label}</span>;
}
