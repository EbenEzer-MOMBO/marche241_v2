'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, FileText, MapPin, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { creerBoutique, CreerBoutiqueData } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { BOUTIQUE_DESCRIPTION_MAX_LENGTH } from '@/lib/constants/boutique';
import { markOnboardingActive } from '@/lib/onboarding/storage';

export const BoutiqueStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { user, isAuthenticated } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    ville: '',
    telephone: user?.telephone || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        telephone: prev.telephone || user.telephone || '',
        email: prev.email || user.email || '',
        ville: prev.ville || user.ville || '',
      }));
      markOnboardingActive(user.id);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue =
      name === 'description' && value.length > BOUTIQUE_DESCRIPTION_MAX_LENGTH
        ? value.slice(0, BOUTIQUE_DESCRIPTION_MAX_LENGTH)
        : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const isFormValid = () =>
    formData.nom.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.adresse.trim() !== '' &&
    formData.ville.trim() !== '';

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
        email: formData.email.trim() || undefined,
      };

      const response = await creerBoutique(boutiqueData);
      if (response.success && response.boutique) {
        localStorage.setItem('admin_boutique', JSON.stringify(response.boutique));
        success('Boutique créée', 'Passez à la configuration du paiement.');
        router.push('/admin/onboarding/paiement');
      } else {
        setError(response.message || 'Erreur lors de la création de la boutique');
        showError(response.message || 'Erreur lors de la création de la boutique', 'Création échouée');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la boutique';
      setError(errorMessage);
      showError(errorMessage, 'Erreur de création');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPreview && (!isAuthenticated || !user)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer votre boutique</h1>
        <p className="mt-1 text-gray-600">Ces informations apparaîtront sur votre vitrine.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nom" className="mb-2 block text-sm font-medium text-gray-700">
              Nom de la boutique *
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                placeholder="Ex: Boutique de Marie"
                className="block w-full rounded-lg border border-gray-300 py-3 pr-3 pl-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
              Description * <span className="font-normal text-gray-500">(max. {BOUTIQUE_DESCRIPTION_MAX_LENGTH})</span>
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                maxLength={BOUTIQUE_DESCRIPTION_MAX_LENGTH}
                rows={4}
                placeholder="Décrivez votre boutique et vos produits..."
                className="block w-full resize-none rounded-lg border border-gray-300 py-3 pr-3 pl-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <p className="mt-1 text-right text-xs text-gray-500">
              {formData.description.length} / {BOUTIQUE_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label htmlFor="adresse" className="mb-2 block text-sm font-medium text-gray-700">
              Adresse *
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                required
                placeholder="Adresse complète de votre boutique"
                className="block w-full rounded-lg border border-gray-300 py-3 pr-3 pl-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ville" className="mb-2 block text-sm font-medium text-gray-700">
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
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="mb-2 block text-sm font-medium text-gray-700">
              Téléphone de contact
            </label>
            <PhoneNumberInput
              value={formData.telephone}
              onChange={(value) => setFormData((prev) => ({ ...prev, telephone: value }))}
              onValidationChange={setIsPhoneValid}
              placeholder="6XXXXXXX"
              required={false}
            />
            {formData.telephone && !isPhoneValid && (
              <p className="mt-1 text-sm text-red-600">Numéro de téléphone invalide</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email de contact
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@maboutique.com"
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Création en cours...' : 'Créer ma boutique'}
            <Building2 className="ml-2 h-4 w-4" />
          </button>
        </form>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
