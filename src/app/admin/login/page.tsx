'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';

type LoginMethod = 'email' | 'whatsapp';

export default function AdminLoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('whatsapp');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const [whatsAppExists, setWhatsAppExists] = useState<boolean | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const { demanderCode, isLoading, error, toasts, removeToast } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vérifier si la session a expiré
  useEffect(() => {
    const sessionExpired = searchParams.get('session');
    if (sessionExpired === 'expired') {
      setSessionExpiredMessage('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Effacer le message d'expiration lors de la soumission
    setSessionExpiredMessage(null);

    const success = await demanderCode({ email });
    
    if (success) {
      router.push(`/admin/verify?email=${encodeURIComponent(email)}`);
    }
  };

  // Vérifier le numéro WhatsApp quand il est valide
  useEffect(() => {
    const verifyWhatsApp = async () => {
      if (isPhoneValid && phone && loginMethod === 'whatsapp') {
        setIsCheckingWhatsApp(true);
        setWhatsAppError(null);
        setWhatsAppExists(null);

        try {
          const result = await checkWhatsAppNumber(phone);
          setWhatsAppExists(result.existsWhatsapp);
          
          if (!result.existsWhatsapp) {
            setWhatsAppError('Ce numéro n\'est pas enregistré sur WhatsApp');
          }
        } catch (error) {
          setWhatsAppError('Impossible de vérifier le numéro');
          setWhatsAppExists(false);
        } finally {
          setIsCheckingWhatsApp(false);
        }
      } else {
        setWhatsAppExists(null);
        setWhatsAppError(null);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timer = setTimeout(() => {
      verifyWhatsApp();
    }, 500);

    return () => clearTimeout(timer);
  }, [phone, isPhoneValid, loginMethod]);

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsAppExists) {
      return;
    }

    // Effacer le message d'expiration lors de la soumission
    setSessionExpiredMessage(null);

    const success = await demanderCode({ phone });
    
    if (success) {
      router.push(`/admin/verify?phone=${encodeURIComponent(phone)}`);
    }
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-0 flex items-center justify-center mb-4 overflow-hidden p-0">
            <Image
              src="/marche241_Web_with_text-01.svg"
              alt="Marché 241"
              width={52}
              height={52}
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

        {/* Sélecteur de méthode de connexion */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              loginMethod === 'email'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Utiliser Email
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('whatsapp')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-l border-gray-300 ${
              loginMethod === 'whatsapp'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Utiliser WhatsApp
            </div>
          </button>
        </div>

        {/* Formulaires de connexion */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          {/* Message de session expirée */}
          {sessionExpiredMessage && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">{sessionExpiredMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire Email */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
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

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Un code de vérification à 6 chiffres sera envoyé par email
                </p>
              </div>
            </form>
          )}

          {/* Formulaire WhatsApp */}
          {loginMethod === 'whatsapp' && (
            <form onSubmit={handleWhatsAppSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro WhatsApp
                </label>
                <PhoneNumberInput
                  value={phone}
                  onChange={setPhone}
                  onValidationChange={setIsPhoneValid}
                  required
                  className="w-full"
                />
                
                {/* Statut de vérification WhatsApp */}
                {isPhoneValid && (
                  <div className="mt-2">
                    {isCheckingWhatsApp && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        Vérification du numéro WhatsApp...
                      </div>
                    )}
                    
                    {!isCheckingWhatsApp && whatsAppExists === true && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Numéro WhatsApp vérifié ✓
                      </div>
                    )}
                    
                    {!isCheckingWhatsApp && whatsAppExists === false && (
                      <div className="flex items-center text-sm text-red-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {whatsAppError || 'Numéro non enregistré sur WhatsApp'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isPhoneValid || !whatsAppExists || isCheckingWhatsApp}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Recevoir le code par WhatsApp
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Un code de vérification à 6 chiffres sera envoyé sur WhatsApp
                </p>
              </div>
            </form>
          )}
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
