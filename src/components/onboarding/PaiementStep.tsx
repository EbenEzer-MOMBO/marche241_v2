'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { modifierVendeur } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { normalizeMsisdnInput, validateMsisdn, msisdnPlaceholder } from '@/lib/utils/mobileMoneyMsisdn';
import { markPaiementSkipped } from '@/lib/onboarding/storage';

export const PaiementStep = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [numero, setNumero] = useState(user?.numero_paiement || '');
  const [isLoading, setIsLoading] = useState(false);

  const error = validateMsisdn(numero, 'airtel');
  const isValid = numero.length === 9 && !error;

  const handleSkip = () => {
    if (user?.id) {
      markPaiementSkipped(user.id);
    }
    router.push('/admin/onboarding/done');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !isValid) return;

    setIsLoading(true);
    try {
      const response = await modifierVendeur(parseInt(user.id, 10), {
        numero_paiement: numero,
      });
      if (response.success) {
        const nextNumero = response.vendeur?.numero_paiement || numero;
        const stored = localStorage.getItem('admin_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem('admin_user', JSON.stringify({ ...parsed, numero_paiement: nextNumero }));
        }
        updateUser({ numero_paiement: nextNumero });
        success('Numéro enregistré', 'Vous pourrez le modifier plus tard dans les paramètres.');
        router.push('/admin/onboarding/done');
      } else {
        showError(response.message || 'Impossible d’enregistrer le numéro', 'Erreur');
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Impossible d’enregistrer le numéro', 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurer le paiement</h1>
        <p className="mt-1 text-gray-600">
          Ajoutez votre numéro Airtel Money pour recevoir vos reversements. Vous pouvez passer cette étape.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg border-2 border-gray-900 bg-gray-50 p-4">
          <div className="flex items-center">
            <Image src="/airtel_money.png" alt="" width={40} height={40} className="mr-3 rounded" />
            <div>
              <p className="font-semibold text-gray-900">Airtel Money</p>
              <p className="text-sm text-gray-600">Versement sur ce numéro</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="numero_paiement" className="mb-2 block text-sm font-medium text-gray-700">
            Numéro Airtel Money
          </label>
          <input
            id="numero_paiement"
            type="tel"
            value={numero}
            onChange={(e) => setNumero(normalizeMsisdnInput(e.target.value))}
            placeholder={msisdnPlaceholder('airtel')}
            maxLength={9}
            autoComplete="tel-national"
            className={`w-full rounded-lg border px-3 py-3 focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : isValid
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-black'
            }`}
          />
          {error ? (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Saisissez le numéro associé à votre compte Airtel Money (format {msisdnPlaceholder('airtel')}).
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer et continuer'}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          Passer cette étape
        </button>
      </form>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
