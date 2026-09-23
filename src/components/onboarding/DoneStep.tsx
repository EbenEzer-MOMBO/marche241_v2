'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { buildOnboardingWelcomeMessage, sendWhatsAppMessage } from '@/lib/services/whatsapp';
import { getStoredAdminUserId, isWelcomeSent, markOnboardingCompleted, markWelcomeSent } from '@/lib/onboarding/storage';
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
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { user } = useAuth();
  const [welcomeStatus, setWelcomeStatus] = useState<'idle' | 'sending' | 'sent' | 'skipped'>('idle');
  const boutique = getStoredBoutique();

  useEffect(() => {
    const sendWelcome = async () => {
      if (isPreview) {
        setWelcomeStatus('sent');
        return;
      }
      if (!user?.id) return;
      if (isWelcomeSent(user.id)) {
        setWelcomeStatus('sent');
        return;
      }
      if (!user.telephone) {
        setWelcomeStatus('skipped');
        return;
      }

      setWelcomeStatus('sending');
      const prenom = user.nom.split(' ')[0] || user.nom;
      const sent = await sendWhatsAppMessage(
        user.telephone,
        buildOnboardingWelcomeMessage(prenom, boutique?.slug)
      );
      if (sent) {
        markWelcomeSent(user.id);
        setWelcomeStatus('sent');
      } else {
        setWelcomeStatus('skipped');
      }
    };

    sendWelcome();
  }, [user, boutique?.slug, isPreview]);

  const handleGoDashboard = () => {
    const userId = user?.id || getStoredAdminUserId();
    if (userId) {
      markOnboardingCompleted(userId);
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

      <div className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
        <p className="text-sm text-gray-700">
          {welcomeStatus === 'sending' && 'Envoi du message WhatsApp de bienvenue...'}
          {welcomeStatus === 'sent' && 'Un message WhatsApp de bienvenue a été envoyé sur votre numéro.'}
          {welcomeStatus === 'skipped' &&
            'Le message WhatsApp de bienvenue n’a pas pu être envoyé. Vous pouvez le retrouver plus tard dans votre espace.'}
          {welcomeStatus === 'idle' && 'Finalisation de votre inscription...'}
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
