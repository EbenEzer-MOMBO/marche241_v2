'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';
import { inscrireAffilie } from '@/lib/services/affiliation';

const PAYS_OPTIONS = ['Gabon', 'France', 'Cameroun', "Côte d'Ivoire", 'Sénégal', 'Maroc'];

export default function AffiliationInscriptionPage() {
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', pays: PAYS_OPTIONS[0] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const [whatsAppExists, setWhatsAppExists] = useState<boolean | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ code: string; lienPrincipal: string } | null>(null);

  useEffect(() => {
    const verifyWhatsApp = async () => {
      if (!isPhoneValid || !formData.telephone) {
        setWhatsAppExists(null);
        setWhatsAppError(null);
        return;
      }

      setIsCheckingWhatsApp(true);
      setWhatsAppError(null);

      try {
        const result = await checkWhatsAppNumber(formData.telephone);
        setWhatsAppExists(result.existsWhatsapp);
        if (!result.existsWhatsapp) {
          setWhatsAppError("Ce numéro n'est pas enregistré sur WhatsApp");
        }
      } catch {
        setWhatsAppError('Impossible de vérifier le numéro');
        setWhatsAppExists(false);
      } finally {
        setIsCheckingWhatsApp(false);
      }
    };

    const timer = setTimeout(verifyWhatsApp, 500);
    return () => clearTimeout(timer);
  }, [formData.telephone, isPhoneValid]);

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formData.nom.trim().length >= 2 && emailRegex.test(formData.email) && isPhoneValid && formData.pays.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (!whatsAppExists) {
      setError('Le numéro doit être enregistré sur WhatsApp');
      return;
    }

    setIsLoading(true);
    try {
      const response = await inscrireAffilie(formData);
      setResultat({ code: response.affilie.code, lienPrincipal: response.lien_principal });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (resultat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center">
            <Image
              src="/marche241_Web_with_text-01.svg"
              alt="Marché 241"
              width={52}
              height={52}
              className="object-contain w-full h-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenue chez les affiliés !</h2>
          <p className="text-gray-600">Votre code affilié est prêt à être partagé.</p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Votre code</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{resultat.code}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Votre lien à partager</p>
              <p className="text-sm font-mono break-all text-gray-900">{resultat.lienPrincipal}</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(resultat.lienPrincipal)}
                className="mt-3 text-sm font-medium text-white bg-black rounded-lg px-4 py-2 hover:bg-gray-800"
              >
                Copier le lien
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Un email de confirmation avec ces informations vient de vous être envoyé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center mb-4">
            <Image
              src="/marche241_Web_with_text-01.svg"
              alt="Marché 241"
              width={52}
              height={52}
              className="object-contain w-full h-full"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Devenir affilié</h2>
          <p className="text-gray-600">
            Partagez votre code, touchez une commission sur chaque commande livrée
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                id="nom"
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Votre nom complet"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone (WhatsApp) *
              </label>
              <PhoneNumberInput
                value={formData.telephone}
                onChange={(value) => setFormData({ ...formData, telephone: value })}
                placeholder="6XXXXXXX"
                required
                className="w-full"
                onValidationChange={setIsPhoneValid}
              />
              {isPhoneValid && (
                <div className="mt-2">
                  {isCheckingWhatsApp && <p className="text-sm text-gray-600">Vérification du numéro WhatsApp...</p>}
                  {!isCheckingWhatsApp && whatsAppExists === true && (
                    <p className="text-sm text-green-600">Numéro WhatsApp vérifié ✓</p>
                  )}
                  {!isCheckingWhatsApp && whatsAppExists === false && (
                    <p className="text-sm text-red-600">{whatsAppError}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="pays" className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <select
                id="pays"
                required
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {PAYS_OPTIONS.map((pays) => (
                  <option key={pays} value={pays}>
                    {pays}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isFormValid() || !whatsAppExists || isCheckingWhatsApp}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Inscription en cours...' : 'Devenir affilié'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
