'use client';

import { useCallback, useEffect, useState } from 'react';
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from '@/lib/services/push';

export type PushSupportStatus = 'unsupported' | 'checking' | 'ready';
export type PushPermission = NotificationPermission | 'unsupported';

interface UsePushNotificationsReturn {
  supportStatus: PushSupportStatus;
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const array = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  return array.buffer;
}

/**
 * Gère l'abonnement du vendeur connecté aux notifications push web (VAPID).
 * Ne fait rien côté SSR ni sur les navigateurs sans support Push API.
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [supportStatus, setSupportStatus] = useState<PushSupportStatus>('checking');
  const [permission, setPermission] = useState<PushPermission>('unsupported');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }, []);

  useEffect(() => {
    if (!isSupported()) {
      setSupportStatus('unsupported');
      return;
    }

    setPermission(Notification.permission);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(!!subscription);
        setSupportStatus('ready');
      })
      .catch(() => {
        setSupportStatus('ready');
      });
  }, [isSupported]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      setError('Les notifications push ne sont pas supportées sur ce navigateur');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Autorisation refusée pour les notifications');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const publicKey = await getVapidPublicKey();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const rawKeys = subscription.toJSON().keys;
      if (!rawKeys?.p256dh || !rawKeys?.auth) {
        throw new Error("Abonnement push incomplet (clés manquantes)");
      }

      await subscribeToPush({
        endpoint: subscription.endpoint,
        keys: { p256dh: rawKeys.p256dh, auth: rawKeys.auth },
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible d\'activer les notifications';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const disable = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de désactiver les notifications';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return { supportStatus, permission, isSubscribed, isLoading, error, enable, disable };
}
