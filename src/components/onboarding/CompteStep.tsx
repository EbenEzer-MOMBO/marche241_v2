'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';
import { setPendingOnboardingEmail } from '@/lib/onboarding/storage';

export const CompteStep = () => {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    ville: '',
  });
  const [error, setError] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const [whatsAppExists, setWhatsAppExists] = useState<boolean | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const router = useRouter();
  const { inscrire, isLoading: authLoading, toasts, removeToast } = useAuth();

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        typeof window !== 'undefined' &&
        (window as { turnstile?: { render: Function; remove: Function } }).turnstile &&
        turnstileContainerRef.current &&
        !widgetIdRef.current
      ) {
        clearInterval(interval);
        try {
          const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
          if (siteKey) {
            widgetIdRef.current = (window as { turnstile: { render: Function } }).turnstile.render(
              turnstileContainerRef.current,
              {
                sitekey: siteKey,
                callback: (token: string) => setTurnstileToken(token),
                'expired-callback': () => setTurnstileToken(null),
                'error-callback': () => setTurnstileToken(null),
              }
            );
          }
        } catch (e) {
          console.error('Erreur lors du rendu de Turnstile:', e);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (widgetIdRef.current && typeof window !== 'undefined') {
        const turnstile = (window as { turnstile?: { remove: Function } }).turnstile;
        if (turnstile) {
          try {
            turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch {
            // ignore
          }
        }
      }
    };
  }, []);

  useEffect(() => {
    const verifyWhatsApp = async () => {
      if (isPhoneValid && formData.telephone) {
        setIsCheckingWhatsApp(true);
        setWhatsAppError(null);
        setWhatsAppExists(null);

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
      } else {
        setWhatsAppExists(null);
        setWhatsAppError(null);
      }
    };

    const timer = setTimeout(() => {
      verifyWhatsApp();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.telephone, isPhoneValid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isTurnstileValid = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? turnstileToken !== null
      : true;
    return (
      formData.nom.trim().length >= 2 &&
      emailRegex.test(formData.email) &&
      isPhoneValid &&
      formData.ville.trim().length >= 2 &&
      isTurnstileValid
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (!whatsAppExists) {
      setError('Le numéro doit être enregistré sur WhatsApp pour créer un compte');
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Validation de sécurité requise');
      return;
    }

    const result = await inscrire(
      {
        email: formData.email,
        nom: formData.nom,
        telephone: formData.telephone,
        ville: formData.ville,
      },
      turnstileToken || undefined
    );

    if (result.success && result.email) {
      setPendingOnboardingEmail(result.email);
      router.push(`/admin/onboarding/verif?email=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="space-y-6">
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer votre compte</h1>
        <p className="mt-1 text-gray-600">Renseignez vos informations pour vendre en ligne.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nom" className="mb-2 block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom complet"
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="mb-2 block text-sm font-medium text-gray-700">
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
                {isCheckingWhatsApp && (
                  <p className="text-sm text-gray-600">Vérification du numéro WhatsApp...</p>
                )}
                {!isCheckingWhatsApp && whatsAppExists === true && (
                  <p className="text-sm text-green-600">Numéro WhatsApp vérifié</p>
                )}
                {!isCheckingWhatsApp && whatsAppExists === false && (
                  <p className="text-sm text-red-600">{whatsAppError || 'Numéro non enregistré sur WhatsApp'}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="ville" className="mb-2 block text-sm font-medium text-gray-700">
              Ville *
            </label>
            <input
              id="ville"
              name="ville"
              type="text"
              required
              value={formData.ville}
              onChange={handleChange}
              placeholder="Libreville, Port-Gentil, etc."
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <div ref={turnstileContainerRef} />
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading || !isFormValid() || !whatsAppExists || isCheckingWhatsApp}
            className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {authLoading ? 'Création en cours...' : 'Continuer vers la vérification'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{' '}
        <a href="/admin/login" className="font-medium text-gray-900 hover:underline">
          Se connecter
        </a>
      </p>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
