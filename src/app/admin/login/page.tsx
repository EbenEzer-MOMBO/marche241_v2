'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';

export default function AdminLoginPage() {
  const [telephone, setTelephone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation de l'envoi du code (sans backend)
    setTimeout(() => {
      // Vérifier si le numéro est valide (utilise la validation du composant PhoneNumberInput)
      if (isPhoneValid && telephone.length > 0) {
        // Simuler l'envoi du code WhatsApp
        console.log(`Code simulé envoyé au ${telephone}: 1234`);
        
        // Rediriger vers la page de vérification
        router.push(`/admin/verify?telephone=${encodeURIComponent(telephone)}`);
      } else {
        setError('Numéro de téléphone invalide');
      }
      
      setIsLoading(false);
    }, 1500); // Simuler un délai réseau
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 overflow-hidden p-0">
            <Image
              src="/site-logo.png"
              alt="Marché 241"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              title="Marché 241"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Administration
          </h2>
          <p className="text-gray-600">
            Connectez-vous à votre espace vendeur
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <PhoneNumberInput
                value={telephone}
                onChange={setTelephone}
                placeholder="6XXXXXXX"
                required
                className="w-full"
                onValidationChange={setIsPhoneValid}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isPhoneValid}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  Recevoir le code WhatsApp
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Un code de vérification à 4 chiffres sera envoyé sur WhatsApp
            </p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas encore de compte ?{' '}
            <a href="/admin/register" className="font-medium text-black hover:text-gray-700">
              Créer un compte vendeur
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
