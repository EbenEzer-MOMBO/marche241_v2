'use client';

import { ONBOARDING_STEPS, type OnboardingStepId, getOnboardingStep } from '@/lib/onboarding/steps';

type OnboardingShellProps = {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
};

export const OnboardingShell = ({ currentStep, children }: OnboardingShellProps) => {
  const current = getOnboardingStep(currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ol className="mb-6 flex items-center gap-3" aria-label="Étapes d'inscription">
          {ONBOARDING_STEPS.map((step) => {
            const isCurrent = step.id === currentStep;
            const isDone = step.index < current.index;

            return (
              <li
                key={step.id}
                className="flex items-center gap-2"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                    isCurrent || isDone ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {step.index}
                </span>
                {isCurrent ? (
                  <span className="text-sm font-medium text-gray-900">{step.label}</span>
                ) : (
                  <span className="sr-only">{step.label}</span>
                )}
              </li>
            );
          })}
        </ol>
        {children}
      </main>
    </div>
  );
};
