'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  canVisitOnboardingStep,
  resolveOnboardingStep,
  type OnboardingSnapshot,
  type OnboardingStepId,
} from '@/lib/onboarding/steps';
import {
  getPendingOnboardingEmail,
  isOnboardingCompleted,
  isPaiementSkipped,
} from '@/lib/onboarding/storage';
import type { BoutiqueData } from '@/lib/services/auth';

const getStoredBoutique = (): BoutiqueData | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('admin_boutique');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BoutiqueData;
  } catch {
    return null;
  }
};

export const useOnboardingGate = (requestedStep?: OnboardingStepId, options?: { disabled?: boolean }) => {
  const router = useRouter();
  const { user, isAuthenticated, verifierBoutique } = useAuth();
  const [isReady, setIsReady] = useState(Boolean(options?.disabled));

  useEffect(() => {
    if (options?.disabled) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    const run = async () => {
      const pendingEmail = getPendingOnboardingEmail();
      let boutique = getStoredBoutique();

      if (isAuthenticated && user) {
        try {
          const remoteBoutique = await verifierBoutique();
          if (remoteBoutique) boutique = remoteBoutique;
        } catch {
          // garder le cache local si l'API échoue
        }
      }

      if (cancelled) return;

      const snapshot: OnboardingSnapshot = {
        isAuthenticated,
        pendingEmail,
        hasBoutique: Boolean(boutique?.id),
        hasNumeroPaiement: Boolean(user?.numero_paiement?.trim()),
        skipPaiement: user ? isPaiementSkipped(user.id) : false,
        completed: user ? isOnboardingCompleted(user.id) : false,
      };

      const resolved = resolveOnboardingStep(snapshot);

      if (!requestedStep) {
        if (resolved === 'dashboard' && boutique?.slug) {
          router.replace(`/admin/${boutique.slug}`);
        } else if (resolved === 'dashboard') {
          router.replace('/admin/login');
        } else if (resolved === 'verif' && pendingEmail) {
          router.replace(`/admin/onboarding/verif?email=${encodeURIComponent(pendingEmail)}`);
        } else {
          router.replace(`/admin/onboarding/${resolved}`);
        }
        return;
      }

      if (resolved === 'dashboard' && requestedStep !== 'done') {
        if (boutique?.slug) {
          router.replace(`/admin/${boutique.slug}`);
        } else {
          router.replace('/admin/login');
        }
        return;
      }

      if (!canVisitOnboardingStep(requestedStep, snapshot)) {
        if (resolved === 'verif' && pendingEmail) {
          router.replace(`/admin/onboarding/verif?email=${encodeURIComponent(pendingEmail)}`);
        } else {
          router.replace(`/admin/onboarding/${resolved === 'dashboard' ? 'done' : resolved}`);
        }
        return;
      }

      setIsReady(true);
    };

    const timer = setTimeout(run, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated, options?.disabled, requestedStep, router, user, verifierBoutique]);

  return { isReady };
};
