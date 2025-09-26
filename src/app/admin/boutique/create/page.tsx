'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { creerBoutique, CreerBoutiqueData } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { Building2, ArrowLeft, Store, FileText, MapPin } from 'lucide-react';

export default function CreateBoutiquePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    ville: '',
    telephone: user?.telephone || '',
    email: user?.email || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return formData.nom.trim() !== '' && 
           formData.description.trim() !== '' && 
           formData.adresse.trim() !== '' &&
           formData.ville.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const boutiqueData: CreerBoutiqueData = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        adresse: formData.adresse.trim(),
        ville: formData.ville.trim(),
        telephone: formData.telephone.trim() || undefined,
        email: formData.email.trim() || undefined
      };

      const response = await creerBoutique(boutiqueData);
      
      if (response.success) {
        success('Boutique créée avec succès', 'Votre boutique est maintenant en ligne !');
        
        // Redirection vers la boutique après un court délai
        if (response.boutique) {
          setTimeout(() => {
            router.push(`/admin/${response.boutique!.slug}`);
          }, 1500);
        }
      } else {
        setError(response.message || 'Erreur lors de la création de la boutique');
        showError(response.message || 'Erreur lors de la création de la boutique', 'Création échouée');
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la création de la boutique:', error);
      const errorMessage = error.message || 'Erreur lors de la création de la boutique';
      setError(errorMessage);
      
      // Messages d'erreur spécifiques selon le type
      if (errorMessage.includes('Données invalides')) {
        showError(errorMessage, 'Données invalides');
      } else if (errorMessage.includes('Non autorisé')) {
        showError(errorMessage, 'Non autorisé');
      } else if (errorMessage.includes('existe déjà')) {
        showError(errorMessage, 'Nom déjà utilisé');
      } else if (errorMessage.includes('Erreur serveur')) {
        showError(errorMessage, 'Erreur serveur');
      } else {
        showError(errorMessage, 'Erreur de création');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-black rounded-full p-3">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Créer votre boutique</h1>
          <p className="mt-2 text-gray-600">
            Configurez votre boutique en ligne pour commencer à vendre vos produits
          </p>
        </div>

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>

        {/* Formulaire */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom de la boutique */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Boutique de Marie"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Décrivez votre boutique et vos produits..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  required
                  placeholder="Adresse complète de votre boutique"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                required
                placeholder="Libreville, Port-Gentil, etc."
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone de contact
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="+241 XX XX XX XX"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@maboutique.com"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  Créer ma boutique
                  <Building2 className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Une fois créée, vous pourrez modifier les informations de votre boutique à tout moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
