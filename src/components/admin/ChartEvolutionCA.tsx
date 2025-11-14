'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatistiqueCA } from '@/lib/services/statistiques';

interface ChartEvolutionCAProps {
  data: StatistiqueCA[];
  caTotal: number;
  variation: number;
}

export function ChartEvolutionCA({ data, caTotal, variation }: ChartEvolutionCAProps) {
  // Formater la date pour l'affichage
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Formater le montant pour l'affichage
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Formater les données pour le graphique
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    montant: item.montant
  }));

  // Composant Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-gray-900">
            {formatMontant(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-medium text-gray-900">Évolution du chiffre d'affaires</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Commandes confirmées
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{formatMontant(caTotal)}</p>
          <div className="flex items-center">
            {variation >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  +{variation.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm font-medium text-red-600">
                  {variation.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-sm text-gray-500 ml-2">vs période précédente</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="montant" 
              stroke="#000000" 
              strokeWidth={2}
              dot={{ fill: '#000000', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

