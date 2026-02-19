'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory, getCategoryInfo } from '@/lib/constants/product-categories';

interface SimplifiedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
}

export function SimplifiedProductModal({
  isOpen,
  onClose,
  category,
  onBack,
  onSave
}: SimplifiedProductModalProps) {
  const [formData, setFormData] = useState<any>({
    nom: '',
    prix: '',
    description: '',
    images: [],
    quantite_stock: '10',
    specificFields: {}
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser le formulaire quand le modal se ferme
      setFormData({
        nom: '',
        prix: '',
        description: '',
        images: [],
        quantite_stock: '10',
        specificFields: {}
      });
      setImagePreview([]);
    }
  }, [isOpen]);

  if (!isOpen || !category) return null;

  const categoryInfo = getCategoryInfo(category);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      specificFields: {
        ...prev.specificFields,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setImagePreview((prev) => [...prev, ...newImages]);
          setFormData((prev: any) => ({
            ...prev,
            images: [...prev.images, ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construire les variants selon le type de produit
    const variants = buildVariants();
    
    const productData = {
      ...formData,
      category: category,
      variants: variants
    };
    
    console.log('💾 Données du produit à sauvegarder:', productData);
    onSave(productData);
  };

  const buildVariants = () => {
    const specificFields = formData.specificFields;
    const variants: any = {
      variants: [],
      options: []
    };

    // Construire les variants selon la catégorie
    if (category === 'vetements') {
      const tailles = specificFields.tailles || [];
      const couleurs = specificFields.couleurs || [];
      
      tailles.forEach((taille: string) => {
        couleurs.forEach((couleur: string) => {
          variants.variants.push({
            nom: `${taille} - ${couleur}`,
            prix: formData.prix,
            stock: Math.floor(parseInt(formData.quantite_stock) / (tailles.length * couleurs.length))
          });
        });
      });
    } else if (category === 'chaussures') {
      const pointures = specificFields.pointures || [];
      const couleurs = specificFields.couleurs || [];
      
      pointures.forEach((pointure: string) => {
        couleurs.forEach((couleur: string) => {
          variants.variants.push({
            nom: `${pointure} - ${couleur}`,
            prix: formData.prix,
            stock: Math.floor(parseInt(formData.quantite_stock) / (pointures.length * couleurs.length))
          });
        });
      });
    } else if (category === 'electronique' && specificFields.couleurs) {
      const couleurs = specificFields.couleurs || [];
      couleurs.forEach((couleur: string) => {
        variants.variants.push({
          nom: couleur,
          prix: formData.prix,
          stock: Math.floor(parseInt(formData.quantite_stock) / couleurs.length)
        });
      });
    }

    return variants;
  };

  const renderSpecificField = (field: any) => {
    const value = formData.specificFields[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleSpecificFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleSpecificFieldChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[60px]">
              {field.options?.map((option: string) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const newValues = selectedValues.includes(option)
                      ? selectedValues.filter((v: string) => v !== option)
                      : [...selectedValues, option];
                    handleSpecificFieldChange(field.name, newValues);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedValues.includes(option)
                      ? `${categoryInfo.color} ${categoryInfo.bgColor} border-2 border-current`
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedValues.length} sélectionné{selectedValues.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* En-tête */}
        <div className={`${categoryInfo.bgColor} ${categoryInfo.color} p-6 border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onBack}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryInfo.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ajouter {categoryInfo.nom.toLowerCase()}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-12">
                  Remplissez les informations essentielles
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Champs de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">📝 Informations de base</h3>
            
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder={`Ex: ${categoryInfo.description.split(',')[0]}`}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Prix et Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.prix}
                  onChange={(e) => handleInputChange('prix', e.target.value)}
                  placeholder="5000"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantite_stock}
                  onChange={(e) => handleInputChange('quantite_stock', e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre produit..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos du produit
              </label>
              <div className="space-y-3">
                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Champs spécifiques à la catégorie */}
          {categoryInfo.fields.specific.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <span>{categoryInfo.icon}</span> Détails spécifiques
              </h3>
              {categoryInfo.fields.specific.map((field) => renderSpecificField(field))}
            </div>
          )}

          {/* Footer intégré au formulaire */}
          <div className="pt-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 ${categoryInfo.bgColor} ${categoryInfo.color} border-2 border-current rounded-lg hover:opacity-90 transition-opacity font-medium`}
            >
              Ajouter le produit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
