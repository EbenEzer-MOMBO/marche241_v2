import { Globe } from 'lucide-react';
import { libellePays } from '@/lib/utils/geo-pays';
import type { StatsVuesGeo } from '@/lib/services/vues';

interface GeoViewsCardProps {
  lignes: StatsVuesGeo[];
  periodeJours: number;
}

interface PaysAgregé {
  code: string;
  nom: string;
  nombre_vues: number;
}

function agregerParPays(lignes: StatsVuesGeo[]): PaysAgregé[] {
  const parPays = new Map<string, number>();

  lignes.forEach((ligne) => {
    const code = (ligne.pays || 'Inconnu').trim() || 'Inconnu';
    parPays.set(code, (parPays.get(code) || 0) + (ligne.nombre_vues || 0));
  });

  return Array.from(parPays.entries())
    .map(([code, nombre_vues]) => ({
      code,
      nom: libellePays(code),
      nombre_vues,
    }))
    .sort((a, b) => b.nombre_vues - a.nombre_vues)
    .slice(0, 6);
}

export const GeoViewsCard: React.FC<GeoViewsCardProps> = ({ lignes, periodeJours }) => {
  const pays = agregerParPays(lignes);
  const total = pays.reduce((somme, item) => somme + item.nombre_vues, 0);
  const maxVues = pays[0]?.nombre_vues || 1;
  const libellePeriode = periodeJours === 1 ? '24 h' : `${periodeJours} jours`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-teal-600" aria-hidden="true" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Vues par pays
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          {total.toLocaleString('fr-FR')} vue{total > 1 ? 's' : ''} · {libellePeriode}
        </p>
      </div>

      {pays.length > 0 && total > 0 ? (
        <div className="space-y-4">
          {pays.map((item) => {
            const pourcentage = total > 0 ? Math.round((item.nombre_vues / total) * 100) : 0;
            const largeur = Math.max((item.nombre_vues / maxVues) * 100, 4);

            return (
              <div key={item.code}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.nom}
                  </p>
                  <p className="text-sm text-gray-600 flex-shrink-0">
                    <span className="font-semibold">{item.nombre_vues.toLocaleString('fr-FR')}</span>
                    <span className="text-gray-400 ml-1">({pourcentage}%)</span>
                  </p>
                </div>
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-teal-600"
                    style={{ width: `${largeur}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-10">
          <div className="mx-auto h-12 w-12 bg-teal-50 rounded-full flex items-center justify-center mb-3">
            <Globe className="h-6 w-6 text-teal-400" aria-hidden="true" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Pas encore de répartition
          </h3>
          <p className="text-sm text-gray-500">
            Les pays de vos visiteurs apparaîtront ici après les premières vues géolocalisées.
          </p>
        </div>
      )}
    </div>
  );
};
