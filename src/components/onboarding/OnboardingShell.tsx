'use client';

import { ONBOARDING_STEPS, type OnboardingStepId, getOnboardingStep } from '@/lib/onboarding/steps';

type OnboardingShellProps = {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
};

export const OnboardingShell = ({ currentStep, children }: OnboardingShellProps) => {
  const current = getOnboardingStep(currentStep);
  const progressPercent = Math.round((current.index / ONBOARDING_STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black text-sm font-bold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Onboarding vendeur</p>
                <p className="text-xs text-gray-500">Étape {current.index} sur {ONBOARDING_STEPS.length}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700" aria-live="polite">
              {progressPercent}%
            </p>
          </div>

          <div
            className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            aria-label="Progression de l'inscription"
          >
            <div className="h-full rounded-full bg-black transition-all" style={{ width: `${progressPercent}%` }} />
          </div>

          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-6" aria-label="Étapes d'inscription">
            {ONBOARDING_STEPS.map((step) => {
              const isCurrent = step.id === currentStep;
              const isDone = step.index < current.index;

              return (
                <li key={step.id} className="min-w-0">
                  <div
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium ${
                      isCurrent
                        ? 'bg-black text-white'
                        : isDone
                          ? 'bg-green-50 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        isCurrent
                          ? 'bg-white text-black'
                          : isDone
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-500'
                      }`}
                    >
                      {isDone ? '✓' : step.index}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
};
