import { useEffect } from 'react';
import { api } from '@/lib/api';

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Envoie un ping périodique à l'API pour maintenir derniere_connexion à jour.
 * Le ping est suspendu quand l'onglet n'est pas visible.
 */
export function useSessionHeartbeat(isAuthenticated: boolean): void {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const ping = async (): Promise<void> => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      try {
        await api.patch('/vendeurs/me/ping');
      } catch {
        // Silencieux — un ping raté n'interrompt pas la session
      }
    };

    ping();

    const interval = setInterval(ping, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated]);
}
