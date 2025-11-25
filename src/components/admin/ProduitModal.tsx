'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { ProduitDB, Categorie } from '@/lib/database-types';
import { ProductFormData, ProductVariant, ProductOption } from '@/types/ProductTypes';
import ImagesSection from './product-sections/ImagesSection';
import VariantsSection from './product-sections/VariantsSection';
import OptionsSection from './product-sections/OptionsSection';

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
  const [formData, setFormData] = useState<ProductFormData>({
    nom: '',
    description: '',
    categorie_id: '',
    images: [],
    prix: '',
    prix_promo: '',
    en_stock: 0,
    statut: 'actif',
    variants: [],
    options: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variantImageFiles, setVariantImageFiles] = useState<Map<number, File>>(new Map());

  // Charger les données du produit lors de l'ouverture du modal
  useEffect(() => {
    if (produit) {
      console.log('[ProduitModal] Chargement du produit:', produit);

      // Charger les images
      const productImages = produit.images && produit.images.length > 0
        ? produit.images
        : produit.image_principale
          ? [produit.image_principale]
          : [];

      // Charger les variants et options depuis le JSON
      let variants: ProductVariant[] = [];
      let options: ProductOption[] = [];

      if (produit.variants) {
        // Si variants est un objet avec variants et options séparés
        if (typeof produit.variants === 'object' && 'variants' in produit.variants) {
          variants = produit.variants.variants || [];
          options = produit.variants.options || [];
        } else if (Array.isArray(produit.variants)) {
          // Si c'est un tableau de variants
          variants = produit.variants.map((v: any) => ({
            nom: v.nom,
            quantite: v.quantite || 0,
            prix: v.prix,
            prix_promo: v.prix_promo,
            image: v.image
          }));
        }
      }

      setFormData({
        nom: produit.nom || '',
        description: produit.description || '',
        categorie_id: produit.categorie_id?.toString() || '',
        images: productImages,
        prix: produit.prix ? produit.prix.toString() : '',
        prix_promo: produit.prix_promo ? produit.prix_promo.toString() : '',
        en_stock: produit.quantite_stock || 0,
        statut: produit.actif ? 'actif' : 'inactif',
        variants,
        options
      });
    } else {
      // Réinitialiser le formulaire pour un nouveau produit
      setFormData({
        nom: '',
        description: '',
        categorie_id: '',
        images: [],
        prix: '',
        prix_promo: '',
        en_stock: 0,
        statut: 'actif',
        variants: [],
        options: []
      });
    }
    setError('');
  }, [produit, isOpen]);

  // Calculer le stock total à partir des variants
  useEffect(() => {
    const totalStock = formData.variants.reduce((total, variant) => {
      return total + variant.quantite;
    }, 0);

    if (totalStock !== formData.en_stock) {
      setFormData(prev => ({ ...prev, en_stock: totalStock }));
    }
  }, [formData.variants]);

  // Fonction pour uploader les images en attente
  const uploadPendingImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      console.log('[ProduitModal] Aucune image en attente d\'upload');
      return [];
    }

    console.log(`[ProduitModal] Upload de ${imageFiles.length} image(s) en attente...`);
    setIsUploading(true);
    setError('');

    try {
      const { uploadMultipleImages } = await import('@/lib/services/upload');
      const uploadedImgs = await uploadMultipleImages(imageFiles, boutiqueSlug, 'produits');
      const newImageUrls = uploadedImgs.map(img => img.url);

      console.log('[ProduitModal] Images uploadées avec succès:', newImageUrls);
      setImageFiles([]);
      return newImageUrls;
    } catch (err: any) {
      console.error('[ProduitModal] Erreur lors de l\'upload des images:', err);
      throw new Error(err.message || 'Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour uploader les images de variantes en attente
  const uploadVariantImages = async (): Promise<Map<number, string>> => {
    const uploadedUrls = new Map<number, string>();

    if (variantImageFiles.size === 0) {
      console.log('[ProduitModal] Aucune image de variant en attente');
      return uploadedUrls;
    }

    console.log(`[ProduitModal] Upload de ${variantImageFiles.size} image(s) de variant en attente...`);
    setIsUploading(true);

    try {
      const { uploadImage } = await import('@/lib/services/upload');

      // Uploader chaque image de variant
      for (const [index, file] of variantImageFiles.entries()) {
        console.log(`[ProduitModal] Upload image variant ${index}:`, file.name);
        const result = await uploadImage(file, boutiqueSlug, 'produits/variants');
        uploadedUrls.set(index, result.url);
      }

      console.log('[ProduitModal] Images de variants uploadées avec succès');
      setVariantImageFiles(new Map());
      return uploadedUrls;
    } catch (err: any) {
      console.error('[ProduitModal] Erreur lors de l\'upload des images de variants:', err);
      throw new Error(err.message || 'Erreur lors de l\'upload des images de variants');
    } finally {
      setIsUploading(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.nom.trim()) {
        setError('Le nom du produit est requis');
        setIsLoading(false);
        return;
      }

      if (!formData.categorie_id) {
        setError('La catégorie est requise');
        setIsLoading(false);
        return;
      }

      // Valider le prix uniquement si aucun variant n'est défini
      if (formData.variants.length === 0) {
        if (!formData.prix || parseFloat(formData.prix) <= 0) {
          setError('Le prix doit être supérieur à 0');
          setIsLoading(false);
          return;
        }
      }

      if (formData.en_stock <= 0) {
        setError('Le stock doit être supérieur à 0. Veuillez ajouter des variants avec des quantités.');
        setIsLoading(false);
        return;
      }

      // Uploader les images en attente avant la validation
      console.log('[ProduitModal] Vérification des images en attente...');
      console.log('[ProduitModal] Images déjà uploadées:', formData.images);
      console.log('[ProduitModal] Fichiers en attente:', imageFiles.length);
      console.log('[ProduitModal] Images de variants en attente:', variantImageFiles.size);
      console.log('[ProduitModal] Variants:', formData.variants);
      console.log('[ProduitModal] Options:', formData.options);

      let newlyUploadedImages: string[] = [];
      if (imageFiles.length > 0) {
        console.log('[ProduitModal] Upload des images en attente...');
        newlyUploadedImages = await uploadPendingImages();
      }

      // Uploader les images de variantes en attente
      let variantUploadedUrls = new Map<number, string>();
      if (variantImageFiles.size > 0) {
        console.log('[ProduitModal] Upload des images de variants...');
        variantUploadedUrls = await uploadVariantImages();
      }

      // Mettre à jour les variantes avec les nouvelles images
      const updatedVariants = formData.variants.map((variant, index) => {
        if (variantUploadedUrls.has(index)) {
          return { ...variant, image: variantUploadedUrls.get(index) };
        }
        return variant;
      });

      // Combiner les images existantes avec les nouvelles
      const allImages = [...formData.images, ...newlyUploadedImages];
      console.log('[ProduitModal] Total images après upload:', allImages);

      // Déterminer l'image principale
      let imagePrincipale = allImages.length > 0 ? allImages[0] : null;

      // Si pas d'image principale, utiliser l'image du premier variant qui en a une
      if (!imagePrincipale) {
        const variantWithImage = updatedVariants.find(v => v.image);
        if (variantWithImage) {
          imagePrincipale = variantWithImage.image!;
          console.log('[ProduitModal] Utilisation de l\'image du variant comme image principale:', imagePrincipale);
        }
      }

      // Préparer les données pour l'API
      // Si des variants sont définis, utiliser le prix du premier variant
      let prixProduit = parseFloat(formData.prix);
      let prixPromoProduit = formData.prix_promo ? parseFloat(formData.prix_promo) : undefined;

      if (updatedVariants.length > 0) {
        // Utiliser le prix du premier variant
        const firstVariant = updatedVariants[0];
        prixProduit = firstVariant.prix || prixProduit;
        prixPromoProduit = firstVariant.prix_promo || prixPromoProduit;
      }

      const produitData: any = {
        nom: formData.nom,
        slug: formData.nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: formData.description,
        prix: prixProduit,
        prix_promo: prixPromoProduit,
        en_stock: formData.en_stock,
        quantite_stock: formData.en_stock,
        boutique_id: boutiqueId,
        categorie_id: parseInt(formData.categorie_id),
        images: allImages,
        image_principale: imagePrincipale,
        // Combiner variants et options dans un seul JSON
        variants: {
          variants: updatedVariants,
          options: formData.options
        },
        statut: formData.statut,
      };

      if (produit) {
        produitData.id = produit.id;
      }

      console.log('[ProduitModal] Données du produit préparées:', produitData);

      await onSave(produitData);
      onClose();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde du produit');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Message d'erreur global */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Section 1: Informations de base */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                1. Informations de base
              </h3>
              <div className="space-y-4">
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
                  <div className="flex gap-2">
                    <select
                      value={formData.categorie_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, categorie_id: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.nom}
                        </option>
                      ))}
                    </select>
                    <a
                      href={`/admin/${boutiqueSlug}/categories`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-white hover:text-black hover:border-1 hover:border-black transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      +
                    </a>
                  </div>
                </div>

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
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Images */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                2. Images
              </h3>
              <ImagesSection
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                boutiqueSlug={boutiqueSlug}
                isUploading={isUploading}
                onUploadStateChange={setIsUploading}
                imageFiles={imageFiles}
                onImageFilesChange={setImageFiles}
                onUploadPendingImages={uploadPendingImages}
              />
            </div>

            {/* Section 3: Tarification */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                3. Tarification
              </h3>

              {/* Message d'information si variants actifs */}
              {formData.variants.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ Les champs de tarification sont désactivés car des variantes sont définies.
                    Les prix et quantités sont gérés au niveau de chaque variante.
                  </p>
                </div>
              )}

              <div className="space-y-4">

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix<br></br> (FCFA) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix}
                      onChange={(e) => setFormData(prev => ({ ...prev, prix: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={formData.variants.length > 0}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={formData.variants.length > 0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité en stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.en_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, en_stock: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={formData.variants.length > 0}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Variantes */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                4. Variantes
              </h3>
              <VariantsSection
                variants={formData.variants}
                onVariantsChange={(variants) => setFormData(prev => ({ ...prev, variants }))}
                boutiqueSlug={boutiqueSlug}
                variantImageFiles={variantImageFiles}
                onVariantImageFilesChange={setVariantImageFiles}
                onUploadVariantImages={uploadVariantImages}
              />
            </div>

            {/* Section 5: Options */}
            <div className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                5. Options de personnalisation
              </h3>
              <OptionsSection
                options={formData.options}
                onOptionsChange={(options) => setFormData(prev => ({ ...prev, options }))}
              />
            </div>
          </div>

          {/* Message d'erreur global */}
          {error && (
            <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
