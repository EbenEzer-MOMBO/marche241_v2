'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { demanderCodeConnexionAffilie, verifierCodeConnexionAffilie } from '@/lib/services/affiliation';

export default function AffiliationConnexionPage() {
  const router = useRouter();
  const [etape, setEtape] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [delaiRenvoi, setDelaiRenvoi] = useState(0);

  const demanderCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await demanderCodeConnexionAffilie(email);
      setMessage(response.message);
      setEtape('code');
      setDelaiRenvoi(45);
      const interval = setInterval(() => {
        setDelaiRenvoi((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande de code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifierCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifierCodeConnexionAffilie(email, code);
      router.push('/affiliation/tableau-de-bord');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Espace affilié</h2>
          <p className="text-gray-600">Connectez-vous avec votre email pour accéder à votre tableau de bord</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          {etape === 'email' ? (
            <form onSubmit={demanderCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Envoi...' : 'Recevoir mon code de connexion'}
              </button>
            </form>
          ) : (
            <form onSubmit={verifierCode} className="space-y-6">
              {message && <p className="text-sm text-gray-600">{message}</p>}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code à 4 chiffres
                </label>
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={4}
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 4}
                className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Vérification...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={demanderCode}
                disabled={delaiRenvoi > 0 || isLoading}
                className="w-full text-sm font-medium text-gray-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {delaiRenvoi > 0 ? `Renvoyer un code (${delaiRenvoi}s)` : 'Renvoyer un code'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore affilié ?{' '}
            <a href="/affiliation/inscription" className="font-medium text-gray-900 hover:text-gray-800">
              S&apos;inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
