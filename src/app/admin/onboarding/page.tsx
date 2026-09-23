'use client';

import { Loader2 } from 'lucide-react';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';

export default function OnboardingResumePage() {
  useOnboardingGate();

  return (
    <OnboardingShell currentStep="compte">
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" aria-label="Reprise de l'inscription" />
      </div>
    </OnboardingShell>
  );
}
