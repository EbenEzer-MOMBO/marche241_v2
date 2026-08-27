'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Clock, Save } from 'lucide-react';

interface ZoneLivraison {
  id: number;
  nom: string;
  delimitation?: string;
  prix: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
  actif: boolean;
}

export interface ShippingZoneFormData {
  nom: string;
  delimitation: string;
  prix: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
}

interface ShippingZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShippingZoneFormData) => void;
  zone?: ZoneLivraison | null;
}

const JOURS_OPTIONS = Array.from({ length: 31 }, (_, i) => i); // 0 à 30

const FORM_INITIAL = {
  nom: '',
  delimitation: '',
  prix: '',
  delai_livraison_min: 1,
  delai_livraison_max: 3,
  livraisonImmediate: false
};

export default function ShippingZoneModal({ isOpen, onClose, onSave, zone }: ShippingZoneModalProps) {
  const [formData, setFormData] = useState(FORM_INITIAL);

  const [errors, setErrors] = useState<{
    nom?: string;
    prix?: string;
    delai?: string;
  }>({});

  useEffect(() => {
    if (zone) {
      const livraisonImmediate = zone.delai_livraison_min === 0 && zone.delai_livraison_max === 0;
      setFormData({
        nom: zone.nom,
        delimitation: zone.delimitation || '',
        prix: zone.prix.toString(),
        delai_livraison_min: zone.delai_livraison_min,
        delai_livraison_max: zone.delai_livraison_max,
        livraisonImmediate
      });
    } else {
      setFormData(FORM_INITIAL);
    }
    setErrors({});
  }, [zone, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleLivraisonImmediateChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      livraisonImmediate: checked,
      delai_livraison_min: checked ? 0 : (prev.delai_livraison_min === 0 ? 1 : prev.delai_livraison_min),
      delai_livraison_max: checked ? 0 : (prev.delai_livraison_max === 0 ? 3 : prev.delai_livraison_max)
    }));
    setErrors(prev => ({ ...prev, delai: undefined }));
  };

  const handleDelaiChange = (field: 'delai_livraison_min' | 'delai_livraison_max', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, delai: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la zone est requis';
    }

    if (!formData.prix) {
      newErrors.prix = 'Le prix est requis';
    } else {
      const prix = parseFloat(formData.prix);
      if (isNaN(prix) || prix < 0) {
        newErrors.prix = 'Le prix doit être un nombre positif';
      }
    }

    if (!formData.livraisonImmediate && formData.delai_livraison_max < formData.delai_livraison_min) {
      newErrors.delai = 'Le délai max doit être supérieur ou égal au délai min';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      nom: formData.nom.trim(),
      delimitation: formData.delimitation.trim(),
      prix: parseFloat(formData.prix),
      delai_livraison_min: formData.delai_livraison_min,
      delai_livraison_max: formData.delai_livraison_max
    });
  };

  const handleClose = () => {
    setFormData(FORM_INITIAL);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {zone ? 'Modifier la zone de livraison' : 'Nouvelle zone de livraison'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configurez les détails de la zone de livraison
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              {/* Nom de la zone */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la zone *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Ex: Libreville Centre"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${errors.nom ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                )}
              </div>

              {/* Prix */}
              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de livraison (FCFA) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    value={formData.prix}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    placeholder="Ex: 1000"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${errors.prix ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.prix && (
                  <p className="mt-1 text-sm text-red-600">{errors.prix}</p>
                )}
              </div>

              {/* Délai de livraison */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de livraison
                </label>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    id="livraisonImmediate"
                    type="checkbox"
                    checked={formData.livraisonImmediate}
                    onChange={(e) => handleLivraisonImmediateChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="livraisonImmediate" className="text-sm text-gray-700">
                    Livraison immédiate
                  </label>
                </div>

                {!formData.livraisonImmediate && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="delai_livraison_min" className="block text-xs text-gray-500 mb-1">
                        Min (jours)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          id="delai_livraison_min"
                          value={formData.delai_livraison_min}
                          onChange={(e) => handleDelaiChange('delai_livraison_min', Number(e.target.value))}
                          className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        >
                          {JOURS_OPTIONS.map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="delai_livraison_max" className="block text-xs text-gray-500 mb-1">
                        Max (jours)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          id="delai_livraison_max"
                          value={formData.delai_livraison_max}
                          onChange={(e) => handleDelaiChange('delai_livraison_max', Number(e.target.value))}
                          className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        >
                          {JOURS_OPTIONS.map((j) => (
                            <option key={j} value={j}>{j}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {errors.delai && (
                  <p className="mt-1 text-sm text-red-600">{errors.delai}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.livraisonImmediate
                    ? 'La commande est livrée immédiatement, sans délai.'
                    : 'Indiquez le nombre de jours estimé pour la livraison dans cette zone.'}
                </p>
              </div>

              {/* Délimitation */}
              <div>
                <label htmlFor="delimitation" className="block text-sm font-medium text-gray-700 mb-2">
                  Délimitation de la zone
                </label>
                <textarea
                  id="delimitation"
                  name="delimitation"
                  value={formData.delimitation}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={100}
                  placeholder="Décrivez la zone de livraison (quartiers inclus, limites géographiques...)"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ajoutez des détails pour aider vos clients à identifier leur zone ({formData.delimitation.length}/100)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {zone ? 'Mettre à jour' : 'Créer la zone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
