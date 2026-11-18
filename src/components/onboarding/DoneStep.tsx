'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { markOnboardingCompleted } from '@/lib/onboarding/storage';
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

export const DoneStep = () => {
  const router = useRouter();
  const { user } = useAuth();
  const boutique = getStoredBoutique();

  const handleGoDashboard = () => {
    if (user?.id) {
      markOnboardingCompleted(user.id);
    }
    if (boutique?.slug) {
      router.push(`/admin/${boutique.slug}`);
      return;
    }
    router.push('/admin/login');
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
        <CheckCircle2 className="h-9 w-9 text-white" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Votre boutique est prête</h1>
        <p className="mt-2 text-gray-600">
          {user?.nom ? `Bravo ${user.nom.split(' ')[0]} !` : 'Bravo !'} Vous pouvez maintenant gérer vos produits et partager votre vitrine.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoDashboard}
        className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
      >
        Accéder à mon espace vendeur
      </button>
    </div>
  );
};
