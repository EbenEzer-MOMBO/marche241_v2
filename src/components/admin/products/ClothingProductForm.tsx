'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory, getCategoryInfo } from '@/lib/constants/product-categories';

interface ClothingProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: any[]; // Catégories de la BDD
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any; // Produit à éditer (mode édition)
}

interface ClothingVariant {
  id: string;
  image?: string;
  couleur: string;
  tailles: Array<{ taille: string; stock: number }>;
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
  // Section 1: Infos de base
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  
  // Section 2: Images
  images: string[];
  
  // Section 3: Variants
  variants: ClothingVariant[];
  
  // Section 4: Personnalisations
  personnalisations: Customization[];
}

const SECTIONS = [
  { id: 1, label: 'Infos de base' },
  { id: 2, label: 'Images' },
  { id: 3, label: 'Variants' },
  { id: 4, label: 'Personnalisations' }
];

const TAILLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
const COULEURS = ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Marron', 'Beige'];

export function ClothingProductForm({
  isOpen,
  onClose,
  category,
  onBack,
  onSave,
  categories = [],
  boutiqueId,
  boutiqueSlug,
  productToEdit
}: ClothingProductFormProps) {
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

  // Charger les données du produit à éditer
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

      // Les images sont déjà des URLs
      if (productToEdit.images && productToEdit.images.length > 0) {
        setUploadedImageUrls(productToEdit.images);
      }
      
      setIsDirty(false);
    }
  }, [isOpen, productToEdit]);

  // Vérifier si le formulaire est rempli
  const isFormFilled = () => {
    return formData.nom.trim() !== '' || 
           formData.description.trim() !== '' ||
           formData.images.length > 0 ||
           formData.variants.length > 0 ||
           formData.personnalisations.length > 0;
  };

  // Sauvegarder automatiquement dans localStorage (seulement en mode création)
  useEffect(() => {
    if (isOpen && isDirty && isFormFilled() && !productToEdit) {
      localStorage.setItem('clothing_product_draft', JSON.stringify(formData));
    }
  }, [formData, isOpen, isDirty, productToEdit]);

  // Charger le brouillon au démarrage (seulement en mode création)
  useEffect(() => {
    if (isOpen && !productToEdit) {
      const draft = localStorage.getItem('clothing_product_draft');
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
          localStorage.removeItem('clothing_product_draft');
        }
      }
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    if (!isOpen) {
      // Réinitialiser le formulaire
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
    } else {
      // Pré-sélectionner une catégorie vêtements si elle existe
      const clothingCategory = categories.find(cat => 
        cat.nom.toLowerCase().includes('vêtement') || 
        cat.nom.toLowerCase().includes('vetement') ||
        cat.nom.toLowerCase().includes('mode')
      );
      if (clothingCategory && formData.categorie_id === 0) {
        setFormData(prev => ({ ...prev, categorie_id: clothingCategory.id }));
      }
    }
  }, [isOpen, categories]);

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
        }
        formData.variants.forEach((variant, index) => {
          if (!variant.couleur) {
            newErrors[`variant_${index}_couleur`] = 'La couleur est requise';
          }
          if (!variant.tailles || variant.tailles.length === 0) {
            newErrors[`variant_${index}_tailles`] = 'Au moins une taille est requise';
          }
          // Vérifier que chaque taille a un stock valide
          variant.tailles?.forEach((t, tIndex) => {
            if (t.stock < 0) {
              newErrors[`variant_${index}_taille_${tIndex}_stock`] = 'Le stock doit être >= 0';
            }
          });
          if (variant.prix <= 0) {
            newErrors[`variant_${index}_prix`] = 'Le prix doit être > 0';
          }
          if (variant.prix_promo && variant.prix_promo >= variant.prix) {
            newErrors[`variant_${index}_prix_promo`] = 'Le prix promo doit être inférieur au prix de base';
          }
        });
        break;
      
      case 4:
        // Personnalisations optionnelles
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
      // Si on quitte la section images, uploader les images
      if (currentSection === 2 && formData.images.length > 0) {
        try {
          await uploadImages();
        } catch (error) {
          // L'upload a échoué, on reste sur la section images
          return;
        }
      }
      
      if (currentSection < 4) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  // Fonction pour uploader les images vers le serveur
  const uploadImages = async () => {
    if (formData.images.length === 0 || uploadedImageUrls.length > 0) {
      return; // Déjà uploadées
    }

    // Vérifier si toutes les images sont déjà des URLs (mode édition)
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
        // Convertir base64 en File
        const blob = await fetch(base64Image).then(r => r.blob());
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const file = new File([blob], `product-${timestamp}-${random}.jpg`, { type: 'image/jpeg' });
        
        // Upload via l'API existante
        const result = await uploadImage(file, boutiqueSlug, 'produits');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(uploadedUrls);
      
      // Mettre à jour formData avec les URLs
      setFormData(prev => ({
        ...prev,
        images: uploadedUrls
      }));
      
      console.log('✅ Images uploadées avec succès:', uploadedUrls);
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des images:', error);
      showError('Erreur lors de l\'upload des images');
      throw error; // Empêcher la navigation
    } finally {
      setIsUploadingImages(false);
    }
  };

  const showError = (message: string) => {
    alert(message); // Remplacer par votre système de notification
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    // Valider toutes les sections
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
        // Ajouter l'ID si c'est une édition
        ...(productToEdit?.id && { id: productToEdit.id })
      };
      // Supprimer le brouillon après sauvegarde réussie
      localStorage.removeItem('clothing_product_draft');
      onSave(productData);
    }
  };

  const handleClose = () => {
    if (isFormFilled() && isDirty) {
      const confirmClose = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?');
      if (!confirmClose) {
        return;
      }
    }
    localStorage.removeItem('clothing_product_draft');
    onClose();
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <Section1BasicInfo formData={formData} setFormData={setFormData} errors={errors} categories={categories} />;
      case 2:
        return <Section2Images formData={formData} setFormData={setFormData} errors={errors} />;
      case 3:
        return <Section3Variants formData={formData} setFormData={setFormData} errors={errors} uploadedImageUrls={uploadedImageUrls} />;
      case 4:
        return <Section4Customizations formData={formData} setFormData={setFormData} errors={errors} />;
      default:
        return null;
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
                    {productToEdit ? 'Modifier' : 'Ajouter'} un vêtement
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-12">
                  {SECTIONS[currentSection - 1].label}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
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
                        ? 'bg-white text-purple-600 shadow-sm ring-2 ring-white'
                        : currentSection > section.id
                        ? 'bg-white/70 text-purple-800'
                        : 'bg-white/30 text-purple-200'
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
                      ? 'text-white'
                      : 'text-purple-100'
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
          {renderSection()}
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
            onClick={handleClose}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          
          <div className="flex-1" />
          
          {currentSection < 4 ? (
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

// Section 1: Informations de base
function Section1BasicInfo({ formData, setFormData, errors, categories }: any) {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">1</span>
        Informations de base
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du produit <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => handleChange('nom', e.target.value)}
          placeholder="Ex: T-shirt en coton bio"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.nom ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Décrivez votre produit..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categorie_id}
            onChange={(e) => handleChange('categorie_id', parseInt(e.target.value))}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.categorie_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={0}>Sélectionnez une catégorie</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom}
              </option>
            ))}
          </select>
          {errors.categorie_id && <p className="text-red-500 text-sm mt-1">{errors.categorie_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.statut}
            onChange={(e) => handleChange('statut', e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Section 2: Images
function Section2Images({ formData, setFormData, errors }: any) {
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    let loadedCount = 0;
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    Array.from(files).forEach((file) => {
      // Validation du format
      if (!validFormats.includes(file.type)) {
        alert(`Le fichier ${file.name} n'est pas un format accepté (PNG, JPG, WEBP)`);
        return;
      }

      // Validation de la taille
      if (file.size > 5 * 1024 * 1024) {
        alert(`Le fichier ${file.name} dépasse 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        loadedCount++;
        if (loadedCount === files.length) {
          setFormData({ ...formData, images: [...formData.images, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_: any, i: number) => i !== index)
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">2</span>
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
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-md font-medium">
                  Principale
                </div>
              )}
              {/* Boutons toujours visibles sur mobile, hover sur desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-black/0 sm:hover:bg-black/50 transition-all flex items-end sm:items-center justify-center gap-2 pb-2 sm:pb-0">
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
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
                      onClick={() => moveImage(index, index + 1)}
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
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={handleImageUpload}
        />
      </label>
    </div>
  );
}

// Section 3: Variants
function Section3Variants({ formData, setFormData, errors, uploadedImageUrls }: any) {
  const addVariant = () => {
    const newVariant: ClothingVariant = {
      id: `variant_${Date.now()}`,
      couleur: '',
      tailles: [],
      prix: 0
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant]
    });
  };

  const updateVariant = (index: number, field: keyof ClothingVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const toggleTaille = (variantIndex: number, taille: string) => {
    const newVariants = [...formData.variants];
    const variant = newVariants[variantIndex];
    const tailleIndex = variant.tailles.findIndex((t: { taille: string; stock: number }) => t.taille === taille);
    
    if (tailleIndex > -1) {
      // Retirer la taille
      variant.tailles = variant.tailles.filter((t: { taille: string; stock: number }) => t.taille !== taille);
    } else {
      // Ajouter la taille avec stock à 0
      variant.tailles = [...variant.tailles, { taille, stock: 0 }];
    }
    
    setFormData({ ...formData, variants: newVariants });
  };

  const updateTailleStock = (variantIndex: number, taille: string, stock: number) => {
    const newVariants = [...formData.variants];
    const variant = newVariants[variantIndex];
    const tailleObj = variant.tailles.find((t: { taille: string; stock: number }) => t.taille === taille);
    
    if (tailleObj) {
      tailleObj.stock = stock;
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">3</span>
          Variants du produit
        </h3>
        <button
          type="button"
          onClick={addVariant}
          className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter votre premier variant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.variants.map((variant: ClothingVariant, index: number) => (
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

              <div className="grid grid-cols-2 gap-4">
                {/* Image du variant - Sélection parmi les images uploadées */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image du variant (optionnel)
                  </label>
                  {uploadedImageUrls.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {uploadedImageUrls.map((imageUrl: string, imgIndex: number) => {
                          // Vérifier si l'image est déjà utilisée par un autre variant
                          const isUsedByOtherVariant = formData.variants.some(
                            (v: ClothingVariant, vIndex: number) => 
                              vIndex !== index && v.image === imageUrl
                          );
                          const isSelectedByCurrentVariant = variant.image === imageUrl;
                          
                          return (
                            <button
                              key={imgIndex}
                              type="button"
                              onClick={() => !isUsedByOtherVariant && updateVariant(index, 'image', imageUrl)}
                              disabled={isUsedByOtherVariant}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                isSelectedByCurrentVariant
                                  ? 'border-purple-600 ring-4 ring-purple-200'
                                  : isUsedByOtherVariant
                                  ? 'border-gray-300 opacity-40 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-gray-400 cursor-pointer'
                              }`}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Image ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                              />
                              {isSelectedByCurrentVariant && (
                                <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                  <div className="bg-purple-600 rounded-full p-1">
                                    <Check className="h-6 w-6 text-white stroke-[3]" />
                                  </div>
                                </div>
                              )}
                              {isUsedByOtherVariant && (
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
                      {variant.image && (
                        <button
                          type="button"
                          onClick={() => updateVariant(index, 'image', undefined)}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Retirer l'image
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                      Aucune image disponible. Les images uploadées à l'étape précédente apparaîtront ici.
                    </div>
                  )}
                </div>

                {/* Couleur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={variant.couleur}
                    onChange={(e) => updateVariant(index, 'couleur', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`variant_${index}_couleur`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez</option>
                    {COULEURS.map(couleur => (
                      <option key={couleur} value={couleur}>{couleur}</option>
                    ))}
                  </select>
                  {errors[`variant_${index}_couleur`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_couleur`]}</p>
                  )}
                </div>

                {/* Tailles disponibles avec sélection multiple */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tailles disponibles <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[60px]">
                    {TAILLES.map(taille => {
                      const isSelected = variant.tailles.some(t => t.taille === taille);
                      return (
                        <button
                          key={taille}
                          type="button"
                          onClick={() => toggleTaille(index, taille)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white border-2 border-purple-600'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          {taille}
                        </button>
                      );
                    })}
                  </div>
                  {errors[`variant_${index}_tailles`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_tailles`]}</p>
                  )}
                </div>

                {/* Quantités par taille */}
                {variant.tailles.length > 0 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité en stock par taille <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border border-gray-300 rounded-lg bg-white">
                      {variant.tailles.map((tailleObj, tIndex) => (
                        <div key={tailleObj.taille} className="flex flex-col">
                          <label className="text-xs font-medium text-gray-600 mb-1">
                            {tailleObj.taille}
                          </label>
                          <input
                            type="number"
                            value={tailleObj.stock}
                            onChange={(e) => updateTailleStock(index, tailleObj.taille, parseInt(e.target.value) || 0)}
                            min="0"
                            placeholder="0"
                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                              errors[`variant_${index}_taille_${tIndex}_stock`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`variant_${index}_taille_${tIndex}_stock`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_taille_${tIndex}_stock`]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Stock total: {variant.tailles.reduce((sum: number, t: { taille: string; stock: number }) => sum + t.stock, 0)} unités
                    </p>
                  </div>
                )}

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={variant.prix}
                    onChange={(e) => updateVariant(index, 'prix', parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`variant_${index}_prix`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`variant_${index}_prix`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_prix`]}</p>
                  )}
                </div>

                {/* Prix promo */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix promotionnel (FCFA) - Optionnel
                  </label>
                  <input
                    type="number"
                    value={variant.prix_promo || ''}
                    onChange={(e) => updateVariant(index, 'prix_promo', e.target.value ? parseInt(e.target.value) : undefined)}
                    min="0"
                    placeholder="Laisser vide si pas de promotion"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`variant_${index}_prix_promo`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`variant_${index}_prix_promo`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`variant_${index}_prix_promo`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section 4: Personnalisations
function Section4Customizations({ formData, setFormData, errors }: any) {
  const addCustomization = () => {
    const newCustom: Customization = {
      id: `custom_${Date.now()}`,
      libelle: '',
      type: 'text',
      obligatoire: false
    };
    setFormData({
      ...formData,
      personnalisations: [...formData.personnalisations, newCustom]
    });
  };

  const updateCustomization = (index: number, field: keyof Customization, value: any) => {
    const newCustoms = [...formData.personnalisations];
    newCustoms[index] = { ...newCustoms[index], [field]: value };
    setFormData({ ...formData, personnalisations: newCustoms });
  };

  const removeCustomization = (index: number) => {
    setFormData({
      ...formData,
      personnalisations: formData.personnalisations.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">4</span>
            Personnalisations (optionnel)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Options que vos clients pourront demander
          </p>
        </div>
        <button
          type="button"
          onClick={addCustomization}
          className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium self-start sm:self-auto"
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
            className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter une personnalisation</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.personnalisations.map((custom: Customization, index: number) => (
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors[`custom_${index}_libelle`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={custom.type}
                        onChange={(e) => updateCustomization(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                        value={custom.prix_supplementaire || ''}
                        onChange={(e) => updateCustomization(index, 'prix_supplementaire', e.target.value ? parseInt(e.target.value) : undefined)}
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={custom.obligatoire}
                          onChange={(e) => updateCustomization(index, 'obligatoire', e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
}
