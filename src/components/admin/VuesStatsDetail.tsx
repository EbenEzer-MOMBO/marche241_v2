import { Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { StatistiquesVuesBoutique } from '@/lib/services/vues';

interface VuesStatsDetailProps {
  stats: StatistiquesVuesBoutique;
  nomBoutique?: string;
}

export const VuesStatsDetail: React.FC<VuesStatsDetailProps> = ({ stats, nomBoutique }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          Statistiques de vues
        </h2>
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Eye className="h-5 w-5 text-indigo-600" />
        </div>
      </div>

      {nomBoutique && (
        <p className="text-sm text-gray-600 mb-4">
          Boutique: <span className="font-medium">{nomBoutique}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Vues aujourd'hui */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-blue-900">
              Aujourd'hui
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900">
            {stats.vues_aujourd_hui.toLocaleString()}
          </p>
        </div>

        {/* Vues 7 jours */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-green-900">
              7 jours
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-900">
            {stats.vues_7_jours.toLocaleString()}
          </p>
        </div>

        {/* Vues 30 jours */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-purple-900">
              30 jours
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-900">
            {stats.vues_30_jours.toLocaleString()}
          </p>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Eye className="h-4 w-4 text-amber-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-amber-900">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-900">
            {stats.nombre_vues_total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Informations additionnelles */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-2 w-2 bg-indigo-400 rounded-full mt-2"></div>
          </div>
          <p className="ml-3 text-xs text-gray-600">
            Les vues sont comptabilisées de manière unique par IP et par jour. 
            Une même personne ne peut générer qu'une seule vue par jour.
          </p>
        </div>
      </div>
    </div>
  );
};
