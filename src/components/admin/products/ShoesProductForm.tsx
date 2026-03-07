'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory, getCategoryInfo } from '@/lib/constants/product-categories';

interface ShoesProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: any[];
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any;
}

interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{ pointure: string; stock: number }>;
  prix: number;
  prix_promo?: number;
}

interface Customization {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  prix_supplementaire?: number;
  obligatoire: boolean;
}

interface FormData {
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  images: string[];
  variants: ShoesVariant[];
  personnalisations: Customization[];
}

const SECTIONS = [
  { id: 1, label: 'Infos de base' },
  { id: 2, label: 'Images' },
  { id: 3, label: 'Variants' },
  { id: 4, label: 'Personnalisations' }
];

const POINTURES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const COULEURS = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Marron', 'Beige'];

export function ShoesProductForm({
  isOpen,
  onClose,
  category,
  onBack,
  onSave,
  categories = [],
  boutiqueId,
  boutiqueSlug,
  productToEdit
}: ShoesProductFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    description: '',
    categorie_id: 0,
    statut: 'actif',
    images: [],
    variants: [],
    personnalisations: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && productToEdit) {
      console.log('📝 Chargement des données pour édition:', productToEdit);
      
      setFormData({
        nom: productToEdit.nom || '',
        description: productToEdit.description || '',
        categorie_id: productToEdit.categorie_id || 0,
        statut: productToEdit.statut || 'actif',
        images: productToEdit.images || [],
        variants: productToEdit.variants || [],
        personnalisations: productToEdit.personnalisations || []
      });

      if (productToEdit.images && productToEdit.images.length > 0) {
        setUploadedImageUrls(productToEdit.images);
      }
      
      setIsDirty(false);
    }
  }, [isOpen, productToEdit]);

  const isFormFilled = () => {
    return formData.nom.trim() !== '' || 
           formData.description.trim() !== '' ||
           formData.images.length > 0 ||
           formData.variants.length > 0 ||
           formData.personnalisations.length > 0;
  };

  useEffect(() => {
    if (isOpen && isDirty && isFormFilled() && !productToEdit) {
      localStorage.setItem('shoes_product_draft', JSON.stringify(formData));
    }
  }, [formData, isOpen, isDirty, productToEdit]);

  useEffect(() => {
    if (isOpen && !productToEdit) {
      const draft = localStorage.getItem('shoes_product_draft');
      if (draft && !isDirty) {
        const shouldLoad = confirm('Un brouillon a été trouvé. Voulez-vous le charger ?');
        if (shouldLoad) {
          try {
            const draftData = JSON.parse(draft);
            setFormData(draftData);
            setIsDirty(true);
          } catch (error) {
            console.error('Erreur lors du chargement du brouillon:', error);
          }
        } else {
          localStorage.removeItem('shoes_product_draft');
        }
      }
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser le formulaire quand on ferme
      setCurrentSection(1);
      setFormData({
        nom: '',
        description: '',
        categorie_id: 0,
        statut: 'actif',
        images: [],
        variants: [],
        personnalisations: []
      });
      setErrors({});
      setIsDirty(false);
      setUploadedImageUrls([]);
    } else if (isOpen && !productToEdit) {
      // Mode création : réinitialiser le formulaire et pré-sélectionner la catégorie
      setCurrentSection(1);
      setFormData({
        nom: '',
        description: '',
        categorie_id: 0,
        statut: 'actif',
        images: [],
        variants: [],
        personnalisations: []
      });
      setErrors({});
      setUploadedImageUrls([]);
      
      // Pré-sélectionner une catégorie chaussures si elle existe
      const shoesCategory = categories.find(cat => 
        cat.nom.toLowerCase().includes('chaussure') || 
        cat.nom.toLowerCase().includes('shoe')
      );
      if (shoesCategory) {
        setFormData(prev => ({ ...prev, categorie_id: shoesCategory.id }));
      }
    }
  }, [isOpen, categories, productToEdit]);

  if (!isOpen || !category) return null;

  const categoryInfo = getCategoryInfo(category);

  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (section) {
      case 1:
        if (!formData.nom.trim()) {
          newErrors.nom = 'Le nom du produit est requis';
        }
        if (!formData.categorie_id) {
          newErrors.categorie_id = 'La catégorie est requise';
        }
        break;
      
      case 2:
        if (formData.images.length === 0) {
          newErrors.images = 'Au moins une image est requise';
        }
        break;
      
      case 3:
        if (formData.variants.length === 0) {
          newErrors.variants = 'Au moins un variant est requis';
        } else {
          formData.variants.forEach((variant, index) => {
            if (!variant.couleur) {
              newErrors[`variant_${index}_couleur`] = 'La couleur est requise';
            }
            if (!variant.pointures || variant.pointures.length === 0) {
              newErrors[`variant_${index}_pointures`] = 'Au moins une pointure est requise';
            }
            if (!variant.prix || variant.prix <= 0) {
              newErrors[`variant_${index}_prix`] = 'Le prix est requis';
            }
            if (variant.prix_promo && variant.prix_promo >= variant.prix) {
              newErrors[`variant_${index}_prix_promo`] = 'Le prix promo doit être inférieur au prix normal';
            }
            variant.pointures?.forEach((p, pIdx) => {
              if (p.stock < 0) {
                newErrors[`variant_${index}_pointure_${pIdx}_stock`] = 'Le stock ne peut pas être négatif';
              }
            });
          });
        }
        break;
      
      case 4:
        formData.personnalisations.forEach((custom, index) => {
          if (!custom.libelle.trim()) {
            newErrors[`custom_${index}_libelle`] = 'Le libellé est requis';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateSection(currentSection)) {
      if (currentSection === 2) {
        try {
          await uploadImages();
        } catch (error) {
          return;
        }
      }
      
      if (currentSection < SECTIONS.length) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const uploadImages = async () => {
    if (formData.images.length === 0 || uploadedImageUrls.length > 0) {
      return;
    }

    const allImagesAreUrls = formData.images.every(img => 
      img.startsWith('http://') || img.startsWith('https://')
    );
    
    if (allImagesAreUrls) {
      console.log('✅ Images déjà uploadées (URLs)');
      setUploadedImageUrls(formData.images);
      return;
    }

    if (!boutiqueSlug) {
      showError('Informations de la boutique manquantes');
      throw new Error('Slug de la boutique manquant');
    }

    setIsUploadingImages(true);
    try {
      const { uploadImage } = await import('@/lib/services/upload');

      const uploadPromises = formData.images.map(async (base64Image, index) => {
        const blob = await fetch(base64Image).then(r => r.blob());
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const file = new File([blob], `product-${timestamp}-${random}.jpg`, { type: 'image/jpeg' });
        
        const result = await uploadImage(file, boutiqueSlug, 'produits');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(uploadedUrls);
      
      setFormData(prev => ({
        ...prev,
        images: uploadedUrls
      }));
      
      console.log('✅ Images uploadées avec succès:', uploadedUrls);
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des images:', error);
      showError('Erreur lors de l\'upload des images');
      throw error;
    } finally {
      setIsUploadingImages(false);
    }
  };

  const showError = (message: string) => {
    alert(message);
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    let allValid = true;
    for (let i = 1; i <= 4; i++) {
      if (!validateSection(i)) {
        allValid = false;
        setCurrentSection(i);
        break;
      }
    }

    if (allValid) {
      const productData = {
        ...formData,
        category: category,
        image_principale: formData.images[0] || undefined,
        ...(productToEdit?.id && { id: productToEdit.id })
      };
      localStorage.removeItem('shoes_product_draft');
      onSave(productData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setFormData(prev => ({ ...prev, images: newImages }));
      
      if (uploadedImageUrls.length > 0) {
        const newUploadedUrls = [...uploadedImageUrls];
        [newUploadedUrls[index], newUploadedUrls[newIndex]] = [newUploadedUrls[newIndex], newUploadedUrls[index]];
        setUploadedImageUrls(newUploadedUrls);
      }
      setIsDirty(true);
    }
  };

  const addVariant = () => {
    const newVariant: ShoesVariant = {
      id: `variant-${Date.now()}`,
      couleur: '',
      pointures: [],
      prix: 0,
      prix_promo: undefined
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
    setIsDirty(true);
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const updateVariant = (index: number, field: keyof ShoesVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
    setIsDirty(true);
  };

  const togglePointure = (variantIndex: number, pointure: string) => {
    const variant = formData.variants[variantIndex];
    const existingPointure = variant.pointures?.find((p: { pointure: string; stock: number }) => p.pointure === pointure);
    
    if (existingPointure) {
      updateVariant(variantIndex, 'pointures', 
        variant.pointures.filter((p: { pointure: string; stock: number }) => p.pointure !== pointure)
      );
    } else {
      updateVariant(variantIndex, 'pointures', [
        ...(variant.pointures || []),
        { pointure, stock: 0 }
      ]);
    }
  };

  const updatePointureStock = (variantIndex: number, pointure: string, stock: number) => {
    const variant = formData.variants[variantIndex];
    updateVariant(variantIndex, 'pointures',
      variant.pointures.map((p: { pointure: string; stock: number }) => 
        p.pointure === pointure ? { ...p, stock: Math.max(0, stock) } : p
      )
    );
  };

  const addCustomization = () => {
    const newCustom: Customization = {
      id: `custom-${Date.now()}`,
      libelle: '',
      type: 'text',
      prix_supplementaire: 0,
      obligatoire: false
    };
    setFormData(prev => ({
      ...prev,
      personnalisations: [...prev.personnalisations, newCustom]
    }));
    setIsDirty(true);
  };

  const removeCustomization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personnalisations: prev.personnalisations.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const updateCustomization = (index: number, field: keyof Customization, value: any) => {
    setFormData(prev => ({
      ...prev,
      personnalisations: prev.personnalisations.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
    setIsDirty(true);
  };

  const renderSection1 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">1</span>
        Informations de base
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du produit <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => handleInputChange('nom', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.nom ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Nike Air Max 2024"
        />
        {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Décrivez les caractéristiques et avantages de vos chaussures..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categorie_id}
            onChange={(e) => handleInputChange('categorie_id', parseInt(e.target.value))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.categorie_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={0}>Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
          {errors.categorie_id && <p className="mt-1 text-sm text-red-600">{errors.categorie_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.statut}
            onChange={(e) => handleInputChange('statut', e.target.value as 'actif' | 'inactif' | 'brouillon')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">2</span>
        Images du produit
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Important :</span> Au moins une image est requise. La première image sera l'image principale.
        </p>
      </div>

      {errors.images && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.images}
        </div>
      )}

      {formData.images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {formData.images.map((image, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium">
                  Principale
                </div>
              )}
              {/* Boutons toujours visibles sur mobile, hover sur desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-black/0 sm:hover:bg-black/50 transition-all flex items-end sm:items-center justify-center gap-2 pb-2 sm:pb-0">
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow-lg"
                      title="Déplacer à gauche"
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {index < formData.images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow-lg"
                      title="Déplacer à droite"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Cliquez pour ajouter</span> ou glissez-déposez
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP jusqu'à 5MB</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">3</span>
          Variants de chaussures
        </h3>
        <button
          type="button"
          onClick={addVariant}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter un variant</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {errors.variants && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.variants}
        </div>
      )}

      {formData.variants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucun variant ajouté</p>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter votre premier variant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.variants.map((variant, index) => {
            const usedImages = formData.variants
              .filter((_, i) => i !== index)
              .map(v => v.image)
              .filter(Boolean);

            const stockTotal = variant.pointures?.reduce((sum: number, p: { pointure: string; stock: number }) => sum + p.stock, 0) || 0;

            return (
              <div key={variant.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image du variant (optionnel)
                    </label>
                    {uploadedImageUrls.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {uploadedImageUrls.map((url, imgIndex) => {
                          const isSelected = variant.image === url;
                          const isUsed = usedImages.includes(url);
                          
                          return (
                            <button
                              key={imgIndex}
                              type="button"
                              onClick={() => !isUsed && updateVariant(index, 'image', url)}
                              disabled={isUsed}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                isSelected 
                                  ? 'border-blue-600 ring-4 ring-blue-200' 
                                  : isUsed 
                                  ? 'border-gray-300 opacity-40 cursor-not-allowed' 
                                  : 'border-gray-200 hover:border-gray-400 cursor-pointer'
                              }`}
                            >
                              <Image
                                src={url}
                                alt={`Image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                  <div className="bg-blue-600 rounded-full p-1">
                                    <Check className="h-6 w-6 text-white stroke-[3]" />
                                  </div>
                                </div>
                              )}
                              {isUsed && (
                                <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                                  <div className="bg-gray-700 rounded-full p-1">
                                    <X className="h-5 w-5 text-white stroke-[2.5]" />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                        Aucune image disponible. Les images uploadées à l'étape précédente apparaîtront ici.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={variant.couleur}
                        onChange={(e) => updateVariant(index, 'couleur', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`variant_${index}_couleur`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Sélectionner</option>
                        {COULEURS.map(couleur => (
                          <option key={couleur} value={couleur}>{couleur}</option>
                        ))}
                      </select>
                      {errors[`variant_${index}_couleur`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`variant_${index}_couleur`]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pointures disponibles <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[60px]">
                      {POINTURES.map(pointure => {
                        const isSelected = variant.pointures?.some((p: { pointure: string; stock: number }) => p.pointure === pointure);
                        return (
                          <button
                            key={pointure}
                            type="button"
                            onClick={() => togglePointure(index, pointure)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-2 border-blue-600'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {pointure}
                          </button>
                        );
                      })}
                    </div>
                    {errors[`variant_${index}_pointures`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`variant_${index}_pointures`]}</p>
                    )}
                  </div>

                  {variant.pointures && variant.pointures.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité en stock par pointure <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border border-gray-300 rounded-lg bg-white">
                        {variant.pointures.map((p: { pointure: string; stock: number }, pIdx: number) => (
                          <div key={pIdx} className="flex flex-col">
                            <label className="text-xs font-medium text-gray-600 mb-1">
                              {p.pointure}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={p.stock}
                              onChange={(e) => updatePointureStock(index, p.pointure, parseInt(e.target.value) || 0)}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock total: {stockTotal} paires
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix (FCFA) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.prix || ''}
                        onChange={(e) => updateVariant(index, 'prix', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`variant_${index}_prix`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="25000"
                      />
                      {errors[`variant_${index}_prix`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`variant_${index}_prix`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix promotionnel (FCFA) - Optionnel
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.prix_promo || ''}
                        onChange={(e) => updateVariant(index, 'prix_promo', parseFloat(e.target.value) || undefined)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`variant_${index}_prix_promo`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="20000"
                      />
                      {errors[`variant_${index}_prix_promo`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`variant_${index}_prix_promo`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Bouton Ajouter variant en fin de liste */}
          <button
            type="button"
            onClick={addVariant}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            Ajouter un autre variant
          </button>
        </div>
      )}
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">4</span>
            Personnalisations (optionnel)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Options que vos clients pourront demander
          </p>
        </div>
        <button
          type="button"
          onClick={addCustomization}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {formData.personnalisations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Aucune personnalisation ajoutée</p>
          <button
            type="button"
            onClick={addCustomization}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter une personnalisation</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.personnalisations.map((custom, index) => (
            <div key={custom.id} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Libellé <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={custom.libelle}
                        onChange={(e) => updateCustomization(index, 'libelle', e.target.value)}
                        placeholder="Ex: Broderie, Gravure..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors[`custom_${index}_libelle`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`custom_${index}_libelle`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`custom_${index}_libelle`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={custom.type}
                        onChange={(e) => updateCustomization(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text">Texte</option>
                        <option value="number">Nombre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix supplémentaire (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={custom.prix_supplementaire || ''}
                        onChange={(e) => updateCustomization(index, 'prix_supplementaire', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={custom.obligatoire}
                          onChange={(e) => updateCustomization(index, 'obligatoire', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Obligatoire</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCustomization(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1: return renderSection1();
      case 2: return renderSection2();
      case 3: return renderSection3();
      case 4: return renderSection4();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
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
                  <h2 className="text-2xl font-bold text-gray-900">
                    {productToEdit ? 'Modifier' : 'Ajouter'} des chaussures
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-12">
                  {SECTIONS[currentSection - 1].label}
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

          {/* Indicateur de progression */}
          <div className="mt-6 flex items-center justify-between">
            {SECTIONS.map((section, index) => (
              <div key={section.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition-all ${
                      currentSection === section.id
                        ? 'bg-white text-blue-600 shadow-sm ring-2 ring-white'
                        : currentSection > section.id
                        ? 'bg-white/70 text-blue-800'
                        : 'bg-white/30 text-blue-200'
                    }`}
                  >
                    {currentSection > section.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      section.id
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${
                    currentSection === section.id
                      ? 'text-blue-800'
                      : 'text-blue-300'
                  }`}>
                    {section.label}
                  </span>
                </div>
                {index < SECTIONS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    currentSection > section.id ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu de la section */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderCurrentSection()}
        </div>

        {/* Footer avec navigation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          {currentSection > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-3 sm:px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 hidden sm:block" />
              <span className="hidden sm:inline">Précédent</span>
              <span className="sm:hidden">←</span>
            </button>
          )}
          
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          
          <div className="flex-1" />
          
          {currentSection < SECTIONS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isUploadingImages}
              className={`px-3 sm:px-4 py-2.5 ${categoryInfo.bgColor} ${categoryInfo.color} border-2 border-current rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUploadingImages ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span className="hidden sm:inline">Upload...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">→</span>
                  <ArrowRight className="h-4 w-4 hidden sm:block" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 sm:px-6 py-2.5 ${categoryInfo.bgColor} ${categoryInfo.color} border-2 border-current rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">{productToEdit ? 'Enregistrer les modifications' : 'Enregistrer le produit'}</span>
              <span className="sm:hidden">Enregistrer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
