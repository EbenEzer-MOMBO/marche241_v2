/**
 * Service pour la gestion des uploads d'images
 */

import api from '@/lib/api';
import config from '@/lib/config';

/**
 * Vérifie si le navigateur est compatible avec FormData
 * @returns {boolean} true si FormData est supporté
 */
export function isFormDataSupported(): boolean {
  return typeof FormData !== 'undefined';
}

// Afficher un avertissement si FormData n'est pas supporté
if (!isFormDataSupported() && typeof window !== 'undefined') {
  console.error('Votre navigateur ne supporte pas FormData, nécessaire pour l\'upload d\'images');
}

export interface ImageUploadResponse {
  url: string;
  path: string;
  taille: number;
  type: string;
  nom_original?: string;
}

/**
 * Upload une seule image
 * @param file - Fichier image à uploader
 * @param boutiqueSlug - Slug de la boutique pour organiser les images
 * @param folder - Dossier de destination (par défaut 'produits')
 * @returns Promise<ImageUploadResponse> - Informations sur l'image uploadée
 */
export async function uploadImage(file: File, boutiqueSlug: string, folder: string = 'produits'): Promise<ImageUploadResponse> {
  try {
    // Vérifier si FormData est supporté
    if (!isFormDataSupported()) {
      throw new Error('Votre navigateur ne supporte pas l\'upload d\'images');
    }
    const formData = new FormData();
    formData.append('image', file);
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('admin_token');
    
    // Construire le chemin du dossier avec le slug de la boutique
    const targetFolder = `${folder}/${boutiqueSlug}`;
    
    // Utiliser directement fetch API au lieu de notre wrapper api
    const response = await fetch(`${config.apiBaseUrl}/upload/image?folder=${targetFolder}`, {
      method: 'POST',
      body: formData,
      headers: {
        // NE PAS définir Content-Type ici, laissez le navigateur le faire
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP ${response.status}`);
    }
    
    if (!data.success || !data.donnees) {
      throw new Error(data.message || 'Erreur lors de l\'upload de l\'image');
    }
    
    return data.donnees;
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    
    if (error.status === 400) {
      throw new Error('Format d\'image non supporté ou taille trop importante (max 5MB)');
    } else if (error.status === 401) {
      throw new Error('Vous devez être connecté pour uploader des images');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur lors de l\'upload');
    }
    
    throw error;
  }
}

/**
 * Upload plusieurs images
 * @param files - Fichiers images à uploader (max 5)
 * @param boutiqueSlug - Slug de la boutique pour organiser les images
 * @param folder - Dossier de destination (par défaut 'produits')
 * @returns Promise<ImageUploadResponse[]> - Informations sur les images uploadées
 */
export async function uploadMultipleImages(files: File[], boutiqueSlug: string, folder: string = 'produits'): Promise<ImageUploadResponse[]> {
  try {
    // Vérifier si FormData est supporté
    if (!isFormDataSupported()) {
      throw new Error('Votre navigateur ne supporte pas l\'upload d\'images');
    }
    if (files.length > 5) {
      throw new Error('Vous ne pouvez pas uploader plus de 5 images à la fois');
    }
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('admin_token');
    
    // Construire le chemin du dossier avec le slug de la boutique
    const targetFolder = `${folder}/${boutiqueSlug}`;
    
    // Utiliser directement fetch API au lieu de notre wrapper api
    const response = await fetch(`${config.apiBaseUrl}/upload/images?folder=${targetFolder}`, {
      method: 'POST',
      body: formData,
      headers: {
        // NE PAS définir Content-Type ici, laissez le navigateur le faire
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP ${response.status}`);
    }
    
    if (!data.success || !data.donnees) {
      throw new Error(data.message || 'Erreur lors de l\'upload des images');
    }
    
    return data.donnees;
  } catch (error: any) {
    console.error('Erreur lors de l\'upload des images:', error);
    
    if (error.status === 400) {
      throw new Error('Format d\'image non supporté ou taille trop importante (max 5MB par image)');
    } else if (error.status === 401) {
      throw new Error('Vous devez être connecté pour uploader des images');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur lors de l\'upload');
    }
    
    throw error;
  }
}

/**
 * Supprime une image
 * @param path - Chemin de l'image à supprimer
 * @returns Promise<void>
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('admin_token');
    
    // Utiliser directement fetch API au lieu de notre wrapper api
    const response = await fetch(`${config.apiBaseUrl}/upload/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ path })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erreur HTTP ${response.status}`);
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la suppression de l\'image');
    }
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    
    if (error.status === 400) {
      throw new Error('Chemin d\'image invalide');
    } else if (error.status === 401) {
      throw new Error('Vous devez être connecté pour supprimer des images');
    } else if (error.status === 500) {
      throw new Error('Erreur serveur lors de la suppression');
    }
    
    throw error;
  }
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage
};
