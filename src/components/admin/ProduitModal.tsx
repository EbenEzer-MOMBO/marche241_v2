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
    stock: '',
    statut: 'actif' as 'actif' | 'inactif' | 'brouillon',
    tags: [] as string[],
    specifications: {} as Record<string, string>,
    images: [] as string[]
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [currentSpecKey, setCurrentSpecKey] = useState('');
  const [currentSpecValue, setCurrentSpecValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ImageUploadResponse[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (produit) {
      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        prix: produit.prix ? produit.prix.toString() : '', // Suppression de la division par 100
        prix_promo: produit.prix_original ? produit.prix_original.toString() : '', // Suppression de la division par 100
        categorie_id: produit.categorie_id?.toString() || '',
        stock: produit.quantite_stock?.toString() || '',
        statut: produit.actif ? 'actif' : 'inactif',
        tags: produit.tags || [],
        specifications: produit.specifications || {},
        images: produit.images || []
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        prix: '',
        prix_promo: '',
        categorie_id: '',
        stock: '',
        statut: 'actif',
        tags: [],
        specifications: {},
        images: []
      });
    }
    setImageFiles([]);
  }, [produit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadError('');

    try {
      // Vérifier s'il y a des images à uploader avant de soumettre le formulaire
      if (imageFiles.length > 0) {
        try {
          setIsUploading(true);
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
        prix: parseFloat(formData.prix), // Suppression de la multiplication par 100
        prix_promo: formData.prix_promo ? parseFloat(formData.prix_promo) : undefined, // Suppression de la multiplication par 100
        stock: parseInt(formData.stock),
        boutique_id: boutiqueId,
        categorie_id: parseInt(formData.categorie_id),
        images: formData.images,
        statut: formData.statut,
        tags: formData.tags,
        specifications: formData.specifications
      };

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

            {/* Prix et stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Prix et stock</h3>
              
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité en stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut *
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as 'actif' | 'inactif' | 'brouillon' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="brouillon">Brouillon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
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
            
            {/* Images déjà uploadées */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Images du produit</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
