'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import {
  getVendeurPasskeys,
  revokeVendeurPasskey,
  startPasskeyRegistration,
  VendeurPasskey
} from '@/lib/services/auth';

interface PasskeysSectionProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const PasskeysSection = ({ onSuccess, onError }: PasskeysSectionProps) => {
  const [passkeys, setPasskeys] = useState<VendeurPasskey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const loadPasskeys = async () => {
    try {
      const items = await getVendeurPasskeys();
      setPasskeys(items);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Impossible de charger les clés d\'accès');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPasskeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const deviceName = typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'Appareil';
      await startPasskeyRegistration(deviceName);
      onSuccess('Clé d\'accès enregistrée');
      await loadPasskeys();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Enregistrement de la clé impossible');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      await revokeVendeurPasskey(id);
      setPasskeys((current) => current.filter((item) => item.id !== id));
      onSuccess('Clé d\'accès révoquée');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Révocation impossible');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Clés d'accès</h3>
        <p className="text-sm text-gray-600">
          Connectez-vous ensuite avec Face ID, Touch ID, Windows Hello ou le code de l'appareil.
          Le code email reste disponible.
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune clé d'accès enregistrée sur ce compte.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center min-w-0">
                <KeyRound className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {passkey.device_name || 'Clé d\'accès'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ajoutée le {new Date(passkey.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRevoke(passkey.id)}
                disabled={revokingId === passkey.id}
                className="ml-3 inline-flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                aria-label="Révoquer cette clé d'accès"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Révoquer
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdding}
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:bg-gray-400"
        aria-label="Ajouter une clé d'accès"
      >
        <Plus className="h-4 w-4 mr-2" />
        {isAdding ? 'Enregistrement…' : 'Ajouter une clé d\'accès'}
      </button>
    </div>
  );
};
