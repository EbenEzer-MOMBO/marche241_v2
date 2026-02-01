'use client';

import { Mail, Phone, Save } from 'lucide-react';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';

interface ProfilSectionProps {
  profilData: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    ville: string;
  };
  setProfilData: (data: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const ProfilSection: React.FC<ProfilSectionProps> = ({
  profilData,
  setProfilData,
  onSave,
  isSaving
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
        <p className="text-sm text-gray-600 mb-6">
          Mettez à jour vos informations personnelles pour votre compte vendeur
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={profilData.nom}
            onChange={(e) => setProfilData({ ...profilData, nom: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={profilData.email}
            onChange={(e) => setProfilData({ ...profilData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Téléphone
          </label>
          <PhoneNumberInput
            value={profilData.telephone || ''}
            onChange={(value) => setProfilData({ ...profilData, telephone: value })}
            placeholder="6XXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ville
          </label>
          <input
            type="text"
            value={profilData.ville}
            onChange={(e) => setProfilData({ ...profilData, ville: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
            placeholder="Votre ville"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
};
