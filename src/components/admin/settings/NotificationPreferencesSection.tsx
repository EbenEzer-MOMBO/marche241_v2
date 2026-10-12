'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Megaphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { getPreferencesRelances, majPreferencesRelances } from '@/lib/services/boosts';

interface NotificationPreferencesSectionProps {
  onSuccess: (message: string, title?: string) => void;
  onError: (message: string, title?: string) => void;
}

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  onSuccess,
  onError
}) => {
  const { supportStatus, permission, isSubscribed, isLoading, enable, disable } = usePushNotifications();
  const [relancesActives, setRelancesActives] = useState<boolean | null>(null);
  const [relancesChargees, setRelancesChargees] = useState(false);
  const [relancesEnCours, setRelancesEnCours] = useState(false);

  useEffect(() => {
    let ignore = false;
    getPreferencesRelances()
      .then((actif) => {
        if (!ignore) setRelancesActives(actif);
      })
      .catch(() => {
        if (!ignore) setRelancesActives(null);
      })
      .finally(() => {
        if (!ignore) setRelancesChargees(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleRelances = async () => {
    if (relancesActives === null) return;
    setRelancesEnCours(true);
    try {
      const suivant = await majPreferencesRelances(!relancesActives);
      setRelancesActives(suivant);
      onSuccess(
        suivant
          ? 'Vous recevrez à nouveau les rappels pour vos boosts non finalisés'
          : 'Vous ne recevrez plus de rappels pour vos boosts non finalisés'
      );
    } catch {
      onError('Impossible de mettre à jour les rappels de boosts');
    } finally {
      setRelancesEnCours(false);
    }
  };

  const handleToggle = async () => {
    if (isSubscribed) {
      const ok = await disable();
      if (ok) {
        onSuccess('Notifications push désactivées');
      } else {
        onError('Impossible de désactiver les notifications push');
      }
      return;
    }

    const ok = await enable();
    if (ok) {
      onSuccess('Notifications push activées', 'Vous serez alerté des nouvelles commandes et changements de statut');
    } else {
      onError(
        typeof Notification !== 'undefined' && Notification.permission === 'denied'
          ? 'Autorisez les notifications dans les paramètres de votre navigateur pour continuer'
          : "Impossible d'activer les notifications push"
      );
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        <Bell className="h-5 w-5 inline mr-2" />
        Notifications
      </h3>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        {supportStatus === 'unsupported' ? (
          <p className="text-sm text-gray-500">
            Les notifications push ne sont pas supportées sur ce navigateur ou cet appareil.
          </p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Notifications de commandes</p>
              <p className="mt-1 text-sm text-gray-500">
                Recevez une notification sur cet appareil pour chaque nouvelle commande et changement de statut,
                même lorsque l&apos;application est fermée.
              </p>
              {permission === 'denied' && (
                <p className="mt-2 text-xs text-red-600">
                  Les notifications sont bloquées dans les paramètres de votre navigateur.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading || supportStatus === 'checking'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isSubscribed
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {isSubscribed ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              <Megaphone className="h-4 w-4 inline mr-2" aria-hidden="true" />
              Rappels pour mes boosts non finalisés (WhatsApp et e-mail)
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Un rappel groupé si un boost reste en brouillon ou en attente de paiement. Vous pouvez le couper à tout moment.
            </p>
          </div>
            {relancesChargees && relancesActives === null ? (
            <p className="text-sm text-gray-500">Indisponible pour le moment.</p>
          ) : (
            <button
              type="button"
              onClick={handleRelances}
              disabled={!relancesChargees || relancesEnCours}
              aria-pressed={relancesActives === true}
              className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                relancesActives
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {(relancesEnCours || !relancesChargees) && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {relancesActives ? 'Désactiver' : 'Activer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
