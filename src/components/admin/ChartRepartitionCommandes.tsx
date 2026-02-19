'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StatistiqueCommandes } from '@/lib/services/statistiques';
import { ORDER_STATUS_CONFIG, getStatusColor, getStatusLabel } from '@/lib/constants/order-status';

interface ChartRepartitionCommandesProps {
  data: StatistiqueCommandes[];
}

export function ChartRepartitionCommandes({ data }: ChartRepartitionCommandesProps) {
  // Formater les données pour le graphique
  const chartData = data.map(item => ({
    name: getStatusLabel(item.statut),
    value: item.nombre,
    pourcentage: item.pourcentage,
    color: getStatusColor(item.statut)
  }));

  // Trier par nombre décroissant
  chartData.sort((a, b) => b.value - a.value);

  // Composant Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-lg font-bold text-gray-900">{data.value} commandes</p>
          <p className="text-sm text-gray-600">{data.pourcentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Composant Legend personnalisé
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.value} ({chartData[index].value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Calcul du total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Répartition des commandes</h3>
        <p className="text-3xl font-bold text-gray-900">{total} commandes</p>
      </div>

      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(entry: any) => `${entry.pourcentage.toFixed(0)}%`}
                labelLine={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Aucune commande pour le moment</p>
          </div>
        </div>
      )}

      {/* Liste détaillée des statuts */}
      <div className="mt-6 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-3" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
              <span className="text-sm text-gray-500 w-12 text-right">
                {item.pourcentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

