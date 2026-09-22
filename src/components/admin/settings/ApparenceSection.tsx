'use client';

import { Palette, Check } from 'lucide-react';

interface ApparenceSectionProps {
  couleurPrimaire: string;
  onChangePrimaire: (value: string) => void;
}

// Palette de couleurs sombres prédéfinies pour la couleur primaire
const COULEURS_PRIMAIRES = [
  { nom: 'Noir', valeur: '#000000' },
  { nom: 'Gris Anthracite', valeur: '#2D3748' },
  { nom: 'Gris Ardoise', valeur: '#334155' },
  { nom: 'Bleu Nuit', valeur: '#1E3A8A' },
  { nom: 'Bleu Foncé', valeur: '#1E40AF' },
  { nom: 'Bleu Marine', valeur: '#0F172A' },
  { nom: 'Indigo', valeur: '#4C1D95' },
  { nom: 'Violet Foncé', valeur: '#581C87' },
  { nom: 'Pourpre', valeur: '#701A75' },
  { nom: 'Rose Foncé', valeur: '#831843' },
  { nom: 'Rouge Bordeaux', valeur: '#7F1D1D' },
  { nom: 'Rouge Foncé', valeur: '#991B1B' },
  { nom: 'Orange Brûlé', valeur: '#9A3412' },
  { nom: 'Marron', valeur: '#78350F' },
  { nom: 'Vert Forêt', valeur: '#14532D' },
  { nom: 'Vert Foncé', valeur: '#15803D' },
  { nom: 'Émeraude', valeur: '#065F46' },
  { nom: 'Sarcelle', valeur: '#134E4A' },
  { nom: 'Cyan Foncé', valeur: '#164E63' },
  { nom: 'Bleu Pétrole', valeur: '#0E7490' }
];

export const ApparenceSection: React.FC<ApparenceSectionProps> = ({
  couleurPrimaire,
  onChangePrimaire
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <Palette className="h-5 w-5 inline mr-2" />
        Apparence de la boutique
      </h3>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {/* Couleur primaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Couleur de la boutique
            </label>
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
              {COULEURS_PRIMAIRES.map((couleur) => (
                <button
                  key={couleur.valeur}
                  type="button"
                  onClick={() => onChangePrimaire(couleur.valeur)}
                  className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    couleurPrimaire === couleur.valeur
                      ? 'border-gray-900 ring-2 ring-gray-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: couleur.valeur }}
                  title={couleur.nom}
                  aria-label={couleur.nom}
                >
                  {couleurPrimaire === couleur.valeur && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: couleurPrimaire }}
              />
              <p className="text-sm text-gray-700 font-medium">
                {COULEURS_PRIMAIRES.find((c) => c.valeur === couleurPrimaire)?.nom || 'Couleur personnalisée'} 
                <span className="ml-2 text-gray-500 font-mono text-xs">{couleurPrimaire}</span>
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Couleur pour les boutons, titres et éléments principaux
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
