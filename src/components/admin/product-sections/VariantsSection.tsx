'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload, X, AlertCircle } from 'lucide-react';
import { ProductVariant, VariantsSectionProps } from '@/types/ProductTypes';
import { uploadImage, deleteImage } from '@/lib/services/upload';

export default function VariantsSection({
    variants,
    onVariantsChange,
    boutiqueSlug,
    variantImageFiles,
    onVariantImageFilesChange,
    onUploadVariantImages
}: VariantsSectionProps) {
    const [error, setError] = useState<string>('');

    // Calculer le stock total
    const totalStock = variants.reduce((total, variant) => total + variant.quantite, 0);

    // Ajouter une variante vide
    const addVariant = () => {
        const newVariant: ProductVariant = {
            nom: '',
            quantite: 0
        };

        onVariantsChange([...variants, newVariant]);
        setError('');
        console.log('[VariantsSection] Ajout d\'une variante vide');
    };

    // Supprimer une variante
    const removeVariant = (index: number) => {
        onVariantsChange(variants.filter((_, i) => i !== index));
    };

    // Mettre à jour la quantité d'une variante
    const updateVariantQuantity = (index: number, quantite: number) => {
        const newVariants = [...variants];
        newVariants[index].quantite = Math.max(0, quantite);
        onVariantsChange(newVariants);
    };

    // Mettre à jour le prix d'une variante
    const updateVariantPrice = (index: number, prix: string) => {
        const newVariants = [...variants];
        const priceValue = prix ? parseFloat(prix) : undefined;
        newVariants[index].prix = priceValue;
        onVariantsChange(newVariants);
    };

    // Mettre à jour le prix promo d'une variante
    const updateVariantPromoPrice = (index: number, prixPromo: string) => {
        const newVariants = [...variants];
        const priceValue = prixPromo ? parseFloat(prixPromo) : undefined;
        newVariants[index].prix_promo = priceValue;
        onVariantsChange(newVariants);
    };

    // Mettre à jour le nom d'une variante
    const updateVariantName = (index: number, nom: string) => {
        const newVariants = [...variants];
        newVariants[index].nom = nom;
        onVariantsChange(newVariants);
    };

    // Gérer la sélection d'image pour une variante
    const handleImageSelect = (index: number, file: File) => {
        const newFiles = new Map(variantImageFiles);
        newFiles.set(index, file);
        onVariantImageFilesChange(newFiles);
        console.log(`[VariantsSection] Image sélectionnée pour variant ${index}:`, file.name);
    };

    // Supprimer l'image d'une variante (déjà uploadée)
    const removeVariantImage = async (index: number) => {
        const imageUrl = variants[index].image;
        if (!imageUrl) return;

        try {
            // Extraire le path depuis l'URL
            const urlParts = imageUrl.split('/');
            const bucketIndex = urlParts.indexOf('public') + 1;
            const path = urlParts.slice(bucketIndex).join('/');

            await deleteImage(path);

            const newVariants = [...variants];
            delete newVariants[index].image;
            onVariantsChange(newVariants);
        } catch (err: any) {
            console.error('Erreur lors de la suppression de l\'image:', err);
            setError(err.message || 'Erreur lors de la suppression de l\'image');
        }
    };

    // Supprimer un fichier en attente
    const removePendingImage = (index: number) => {
        const newFiles = new Map(variantImageFiles);
        newFiles.delete(index);
        onVariantImageFilesChange(newFiles);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Variantes
                    </h3>
                    {totalStock > 0 && (
                        <div className="mt-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-semibold inline-block">
                            Stock total: {totalStock} unités
                        </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                        Les variantes permettent de proposer différentes déclinaisons du produit (couleur, taille, type, etc.)
                    </p>
                </div>

            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Liste des variantes */}
            {variants.length > 0 ? (
                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-3"
                        >
                            {/* En-tête avec nom et bouton supprimer */}
                            <div className="flex items-center justify-between">
                                <input
                                    type="text"
                                    value={variant.nom}
                                    onChange={(e) => updateVariantName(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-medium"
                                    placeholder="Nom de la variante"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer la variante"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Grille des champs */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Prix */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix <br></br> (FCFA)*
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={variant.prix || ''}
                                        onChange={(e) => updateVariantPrice(index, e.target.value)}
                                        placeholder="5000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                {/* Prix Promo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix Promo (FCFA)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={variant.prix_promo || ''}
                                        onChange={(e) => updateVariantPromoPrice(index, e.target.value)}
                                        placeholder="Optionnel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                {/* Quantité en stock */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantité en stock *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={variant.quantite}
                                        onChange={(e) => updateVariantQuantity(index, parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image
                                </label>
                                {variant.image ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={variant.image}
                                            alt={variant.nom}
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeVariantImage(index)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : variantImageFiles.has(index) ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={URL.createObjectURL(variantImageFiles.get(index)!)}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-blue-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePendingImage(index)}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-b-lg text-center">
                                            En attente
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageSelect(index, file);
                                            }}
                                            className="hidden"
                                            id={`variant-image-${index}`}
                                        />
                                        <label
                                            htmlFor={`variant-image-${index}`}
                                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Sélectionner une image
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">
                    Aucune variante ajoutée. Cliquez sur "Ajouter une variante" pour en créer une.
                </p>
            )}
            <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une variante
            </button>
        </div>
    );
}
