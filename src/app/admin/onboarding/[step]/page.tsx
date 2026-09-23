'use client';

import { Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { CompteStep } from '@/components/onboarding/CompteStep';
import { VerifStep } from '@/components/onboarding/VerifStep';
import { BoutiqueStep } from '@/components/onboarding/BoutiqueStep';
import { PaiementStep } from '@/components/onboarding/PaiementStep';
import { ProduitsStep } from '@/components/onboarding/ProduitsStep';
import { DoneStep } from '@/components/onboarding/DoneStep';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { isOnboardingStepId, type OnboardingStepId } from '@/lib/onboarding/steps';

const StepContent = ({ step }: { step: OnboardingStepId }) => {
  if (step === 'compte') return <CompteStep />;
  if (step === 'verif') return <VerifStep />;
  if (step === 'boutique') return <BoutiqueStep />;
  if (step === 'paiement') return <PaiementStep />;
  if (step === 'produits') return <ProduitsStep />;
  return <DoneStep />;
};

const OnboardingStepInner = ({ step }: { step: string }) => {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const validStep: OnboardingStepId = isOnboardingStepId(step) ? step : 'compte';
  const { isReady } = useOnboardingGate(validStep, { disabled: isPreview });

  if (!isOnboardingStepId(step)) {
    return (
      <OnboardingShell currentStep="compte">
        <p className="text-center text-gray-600">Étape inconnue.</p>
      </OnboardingShell>
    );
  }

  if (!isPreview && !isReady) {
    return (
      <OnboardingShell currentStep={validStep}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" aria-label="Chargement de l'étape" />
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell currentStep={validStep}>
      <StepContent step={validStep} />
    </OnboardingShell>
  );
};

export default function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);

  return (
    <Suspense
      fallback={
        <OnboardingShell currentStep="compte">
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        </OnboardingShell>
      }
    >
      <OnboardingStepInner step={step} />
    </Suspense>
  );
}
