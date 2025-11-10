'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { ProduitDB, Categorie } from '@/lib/database-types';
import { uploadImage, uploadMultipleImages, deleteImage, ImageUploadResponse } from '@/lib/services/upload';

interface ProduitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (produit: Partial<ProduitDB>) => Promise<void>;
  produit?: ProduitDB | null;
  categories: Categorie[];
  boutiqueId: number;
  boutiqueSlug: string;
}

export default function ProduitModal({
  isOpen,
  onClose,
  onSave,
  produit,
  categories,
  boutiqueId,
  boutiqueSlug
}: ProduitModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    prix_promo: '',
    categorie_id: '',
    en_stock: 0,
    statut: 'actif' as 'actif' | 'inactif' | 'brouillon',
    tags: [] as string[],
    specifications: {} as Record<string, string>,
    images: [] as string[],
    variants: [] as Array<{nom: string; options: string[]; quantites: number[]}>
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentSpecKey, setCurrentSpecKey] = useState('');
  const [currentSpecValue, setCurrentSpecValue] = useState('');
  const [currentVariantName, setCurrentVariantName] = useState('');
  const [currentVariantOptions, setCurrentVariantOptions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResponse[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Calculer le stock total à partir des variants
  useEffect(() => {
    const totalStock = formData.variants.reduce((total, variant) => {
      return total + variant.quantites.reduce((sum, qty) => sum + qty, 0);
    }, 0);
    
    if (totalStock !== formData.en_stock) {
      setFormData(prev => ({ ...prev, en_stock: totalStock }));
    }
  }, [formData.variants]);

  useEffect(() => {
    if (produit) {
      console.log('[ProduitModal] Chargement du produit:', produit);
      console.log('[ProduitModal] Images du produit:', produit.images);
      console.log('[ProduitModal] Image principale:', produit.image_principale);
      
      // Si images est vide mais image_principale existe, créer un tableau avec image_principale
      const productImages = produit.images && produit.images.length > 0 
        ? produit.images 
        : produit.image_principale 
          ? [produit.image_principale] 
          : [];
      
      console.log('[ProduitModal] Images finales chargées:', productImages);
      
      // Récupérer les variants existants et s'assurer qu'ils ont des quantites
      const existingVariants = produit.variants || [];
      const variantsWithQuantites = existingVariants.map((variant: any) => ({
        ...variant,
        quantites: variant.quantites || variant.options.map(() => 0)
      }));
      
      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix ? produit.prix.toString() : '',
        prix_promo: produit.prix_original ? produit.prix_original.toString() : '',
        categorie_id: produit.categorie_id?.toString() || '',
        en_stock: produit.quantite_stock || 0,
        statut: produit.actif ? 'actif' : 'inactif',
        tags: produit.tags || [],
        specifications: produit.specifications || {},
        images: productImages,
        variants: variantsWithQuantites
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        prix: '',
        prix_promo: '',
        categorie_id: '',
        en_stock: 0,
        statut: 'actif',
        tags: [],
        specifications: {},
        images: [],
        variants: []
      });
    }
    setImageFiles([]);
  }, [produit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadError('');

    try {
      // Variable pour stocker les images finales
      let finalImages = [...formData.images];

      // Vérifier s'il y a des images à uploader avant de soumettre le formulaire
      if (imageFiles.length > 0) {
        try {
          setIsUploading(true);
          // Utiliser le slug de la boutique pour organiser les images par dossier
          const uploadedImgs = await uploadMultipleImages(imageFiles, boutiqueSlug, 'produits');

          console.log('[ProduitModal] Images uploadées:', uploadedImgs);

          // Ajouter les nouvelles images aux images existantes
          const newImageUrls = uploadedImgs.map(img => img.url);
          finalImages = [...finalImages, ...newImageUrls];

          console.log('[ProduitModal] Images finales:', finalImages);

          setUploadedImages(prev => [...prev, ...uploadedImgs]);
          setFormData(prev => ({
            ...prev,
            images: finalImages
          }));

          // Vider la liste des fichiers après l'upload
          setImageFiles([]);
        } catch (error: any) {
          console.error('Erreur lors de l\'upload des images:', error);
          setUploadError(error.message || 'Erreur lors de l\'upload des images');
          setIsLoading(false);
          return; // Arrêter la soumission si l'upload échoue
        } finally {
          setIsUploading(false);
        }
      }

      // Préparer les données du produit pour l'API
      const produitData: any = {
        nom: formData.nom,
        slug: formData.nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        prix: parseFloat(formData.prix),
        prix_promo: formData.prix_promo ? parseFloat(formData.prix_promo) : undefined,
        en_stock: formData.en_stock,
        quantite_stock: formData.en_stock,
        boutique_id: boutiqueId,
        categorie_id: parseInt(formData.categorie_id),
        images: finalImages,
        image_principale: finalImages.length > 0 ? finalImages[0] : null,
        variants: formData.variants,
        statut: formData.statut,
      };

      console.log('[ProduitModal] Données du produit préparées:', produitData);

      if (produit) {
        produitData.id = produit.id;
      }

      await onSave(produitData);
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      setUploadError(error.message || 'Erreur lors de la sauvegarde du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecification = () => {
    if (currentSpecKey.trim() && currentSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [currentSpecKey.trim()]: currentSpecValue.trim()
        }
      }));
      setCurrentSpecKey('');
      setCurrentSpecValue('');
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([key]) => key !== keyToRemove)
      )
    }));
  };

  const addVariant = () => {
    if (currentVariantName.trim() && currentVariantOptions.trim()) {
      const options = currentVariantOptions.split(',').map(opt => opt.trim()).filter(opt => opt);
      if (options.length > 0) {
        setFormData(prev => ({
          ...prev,
          variants: [...prev.variants, { 
            nom: currentVariantName.trim(), 
            options,
            quantites: options.map(() => 0) // Initialiser toutes les quantités à 0
          }]
        }));
        setCurrentVariantName('');
        setCurrentVariantOptions('');
      }
    }
  };

  const updateVariantQuantity = (variantIndex: number, optionIndex: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, vIdx) => {
        if (vIdx === variantIndex) {
          const newQuantites = [...variant.quantites];
          newQuantites[optionIndex] = Math.max(0, quantity); // Empêcher les quantités négatives
          return { ...variant, quantites: newQuantites };
        }
        return variant;
      })
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setUploadError('Vous ne pouvez pas uploader plus de 5 images à la fois');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    setUploadError('');
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = async (index: number) => {
    try {
      const imageToDelete = uploadedImages[index];
      await deleteImage(imageToDelete.path);

      setUploadedImages(prev => prev.filter((_, i) => i !== index));
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageToDelete.url)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      setUploadError('Erreur lors de la suppression de l\'image');
    }
  };

  const removeExistingImage = async (imageUrl: string) => {
    try {
      // Extraire le path depuis l'URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf('public') + 1;
      const path = urlParts.slice(bucketIndex).join('/');
      
      // Supprimer l'image de Supabase Storage
      await deleteImage(path);
      
      // Retirer l'image du formulaire
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      setUploadError('Erreur lors de la suppression de l\'image');
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Utiliser le slug de la boutique pour organiser les images par dossier
      const uploadedImgs = await uploadMultipleImages(imageFiles, boutiqueSlug, 'produits');

      setUploadedImages(prev => [...prev, ...uploadedImgs]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImgs.map(img => img.url)]
      }));

      // Vider la liste des fichiers après l'upload
      setImageFiles([]);
    } catch (error: any) {
      console.error('Erreur lors de l\'upload des images:', error);
      setUploadError(error.message || 'Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {produit ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.categorie_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, categorie_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variants */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Variant (Type, Couleur, Taille, etc.)</h3>
            
            {/* Ajouter un variant (un seul autorisé) */}
            {formData.variants.length === 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom du variant (ex: Type, Couleur, Taille)"
                    value={currentVariantName}
                    onChange={(e) => setCurrentVariantName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Options séparées par des virgules (ex: A, B, C, D)"
                    value={currentVariantOptions}
                    onChange={(e) => setCurrentVariantOptions(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter le variant
                </button>
              </div>
            )}

            {/* Affichage du variant avec quantités */}
            {formData.variants.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{formData.variants[0].nom}</span>
                    <button
                      type="button"
                      onClick={() => removeVariant(0)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer le variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Options avec quantités */}
                  <div className="space-y-2">
                    {formData.variants[0].options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">{option}</span>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-500">Quantité:</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.variants[0].quantites[optionIndex] || 0}
                            onChange={(e) => updateVariantQuantity(0, optionIndex, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stock total */}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-emerald-900">Stock total:</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {formData.en_stock} unités
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Prix et statut */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Prix et statut</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData(prev => ({ ...prev, prix: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix promo (FCFA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix_promo}
                    onChange={(e) => setFormData(prev => ({ ...prev, prix_promo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as 'actif' | 'inactif' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>

            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>

            {/* Message d'erreur */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            {/* Zone de drop */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-4">
                Glissez-déposez vos images ici ou cliquez pour sélectionner
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <div className="flex justify-center space-x-3">
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Sélectionner des images
                </label>
                {imageFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={uploadImages}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>Uploader {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''}</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Images sélectionnées mais pas encore uploadées */}
            {imageFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Images sélectionnées</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images existantes du produit */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Images du produit ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          Principale
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(imageUrl)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer cette image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {produit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
