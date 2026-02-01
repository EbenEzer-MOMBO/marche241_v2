'use client';

import { MapPin, Phone } from 'lucide-react';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';

interface BoutiqueInfoSectionProps {
  boutiqueData: {
    nom: string;
    slug: string;
    description: string;
    adresse: string;
    telephone: string;
  };
  setBoutiqueData: (data: any) => void;
}

export const BoutiqueInfoSection: React.FC<BoutiqueInfoSectionProps> = ({
  boutiqueData,
  setBoutiqueData
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la boutique
          </label>
          <input
            type="text"
            value={boutiqueData.nom}
            onChange={(e) => setBoutiqueData({ ...boutiqueData, nom: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="Nom de votre boutique"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              marche241.com/
            </span>
            <input
              type="text"
              value={boutiqueData.slug}
              onChange={(e) => setBoutiqueData({ ...boutiqueData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
              placeholder="ma-boutique"
              readOnly
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            L&apos;URL unique de votre boutique (lettres minuscules, chiffres et tirets uniquement)
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={boutiqueData.description}
            onChange={(e) => setBoutiqueData({ ...boutiqueData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="Décrivez votre boutique..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Adresse
          </label>
          <input
            type="text"
            value={boutiqueData.adresse}
            onChange={(e) => setBoutiqueData({ ...boutiqueData, adresse: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="Adresse de la boutique"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Téléphone
          </label>
          <PhoneNumberInput
            value={boutiqueData.telephone || ''}
            onChange={(value) => setBoutiqueData({ ...boutiqueData, telephone: value })}
            placeholder="6XXXXXXX"
          />
        </div>
      </div>
    </div>
  );
};
