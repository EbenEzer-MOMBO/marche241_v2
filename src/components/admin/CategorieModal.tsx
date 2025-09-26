'use client';

import { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';

interface Categorie {
  id?: number;
  nom: string;
  slug: string;
  description?: string;
  actif: boolean;
}

interface CategorieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categorie: Categorie) => void;
  categorie?: Categorie | null;
}


export default function CategorieModal({ isOpen, onClose, onSave, categorie }: CategorieModalProps) {
  const [formData, setFormData] = useState<Categorie>({
    nom: '',
    slug: '',
    description: '',
    actif: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categorie) {
      setFormData(categorie);
    } else {
      setFormData({
        nom: '',
        slug: '',
        description: '',
        actif: true
      });
    }
    setErrors({});
  }, [categorie, isOpen]);

  const generateSlug = (nom: string) => {
    return nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNomChange = (nom: string) => {
    setFormData(prev => ({
      ...prev,
      nom,
      slug: generateSlug(nom)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Tag className="h-6 w-6 text-gray-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {categorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleNomChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Électronique"
            />
            {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="electronique"
            />
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Utilisé dans l'URL. Généré automatiquement à partir du nom.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Description de la catégorie..."
            />
          </div>


          {/* Statut */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.actif}
                onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.checked }))}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Catégorie active
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Les catégories inactives ne sont pas visibles sur votre boutique.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {categorie ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
