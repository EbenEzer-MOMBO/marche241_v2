'use client';

import { useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { ImagesSectionProps } from '@/types/ProductTypes';
import { uploadMultipleImages, deleteImage, ImageUploadResponse } from '@/lib/services/upload';

export default function ImagesSection({
    images,
    onImagesChange,
    boutiqueSlug,
    isUploading,
    onUploadStateChange
}: ImagesSectionProps) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    // Gérer la sélection de fichiers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 5) {
            setError('Vous ne pouvez pas uploader plus de 5 images à la fois');
            return;
        }

        setImageFiles(prev => [...prev, ...files]);
        setError('');
    };

    // Supprimer un fichier sélectionné (pas encore uploadé)
    const removeFile = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Uploader les images sélectionnées
    const uploadImages = async () => {
        if (imageFiles.length === 0) return;

        onUploadStateChange(true);
        setError('');

        try {
            const uploadedImgs = await uploadMultipleImages(imageFiles, boutiqueSlug, 'produits');
            const newImageUrls = uploadedImgs.map(img => img.url);

            onImagesChange([...images, ...newImageUrls]);
            setImageFiles([]);
        } catch (err: any) {
            console.error('Erreur lors de l\'upload des images:', err);
            setError(err.message || 'Erreur lors de l\'upload des images');
        } finally {
            onUploadStateChange(false);
        }
    };

    // Supprimer une image existante
    const removeExistingImage = async (imageUrl: string) => {
        try {
            // Extraire le path depuis l'URL
            const urlParts = imageUrl.split('/');
            const bucketIndex = urlParts.indexOf('public') + 1;
            const path = urlParts.slice(bucketIndex).join('/');

            await deleteImage(path);
            onImagesChange(images.filter(img => img !== imageUrl));
        } catch (err: any) {
            console.error('Erreur lors de la suppression de l\'image:', err);
            setError(err.message || 'Erreur lors de la suppression de l\'image');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Images du produit</h3>

            {/* Message d'erreur */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
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
                <div>
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
                                    onClick={() => removeFile(index)}
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
            {images.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Images du produit ({images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((imageUrl, index) => (
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

            {/* Message si aucune image */}
            {images.length === 0 && imageFiles.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                    Aucune image ajoutée. La première image uploadée sera l'image principale du produit.
                </p>
            )}
        </div>
    );
}
