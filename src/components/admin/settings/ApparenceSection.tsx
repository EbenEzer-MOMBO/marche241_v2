'use client';

import { Palette } from 'lucide-react';

interface ApparenceSectionProps {
  couleurPrimaire: string;
  couleurSecondaire: string;
  onChangePrimaire: (value: string) => void;
  onChangeSecondaire: (value: string) => void;
}

export const ApparenceSection: React.FC<ApparenceSectionProps> = ({
  couleurPrimaire,
  couleurSecondaire,
  onChangePrimaire,
  onChangeSecondaire
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <Palette className="h-5 w-5 inline mr-2" />
        Apparence de la boutique
      </h3>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur primaire
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={couleurPrimaire}
                onChange={(e) => onChangePrimaire(e.target.value)}
                className="h-10 w-20 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
                disabled
              />
              <input
                type="text"
                value={couleurPrimaire}
                onChange={(e) => onChangePrimaire(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent font-mono text-sm bg-gray-100 cursor-not-allowed"
                placeholder="#000000"
                disabled
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Couleur principale de votre boutique
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur secondaire
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={couleurSecondaire}
                onChange={(e) => onChangeSecondaire(e.target.value)}
                className="h-10 w-20 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
                disabled
              />
              <input
                type="text"
                value={couleurSecondaire}
                onChange={(e) => onChangeSecondaire(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent font-mono text-sm bg-gray-100 cursor-not-allowed"
                placeholder="#ffffff"
                disabled
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Couleur secondaire de votre boutique
            </p>
          </div>
        </div>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Fonctionnalité à venir :</span> La personnalisation des couleurs sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
};
