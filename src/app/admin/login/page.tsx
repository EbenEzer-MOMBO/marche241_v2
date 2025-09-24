'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const { demanderCode, isLoading, error, toasts, removeToast } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await demanderCode({ email });
    
    if (success) {
      // Rediriger vers la page de vérification
      router.push(`/admin/verify?email=${encodeURIComponent(email)}`);
    }
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  Recevoir le code par email
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Un code de vérification à 6 chiffres sera envoyé par email
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
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
