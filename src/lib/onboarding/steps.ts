export const ONBOARDING_STEPS = [
  { id: 'compte', label: 'Compte', index: 1 },
  { id: 'verif', label: 'Vérif', index: 2 },
  { id: 'boutique', label: 'Boutique', index: 3 },
  { id: 'paiement', label: 'Paiement', index: 4 },
  { id: 'done', label: 'Terminé', index: 5 },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id'];

export const ONBOARDING_STORAGE = {
  pendingEmail: 'onboarding_pending_email',
  pending: 'onboarding_pending',
  activePrefix: 'onboarding_active_',
  skipPaiementPrefix: 'onboarding_skip_paiement_',
  welcomeSentPrefix: 'onboarding_welcome_sent_',
  completedPrefix: 'onboarding_completed_',
} as const;

export type OnboardingSnapshot = {
  isAuthenticated: boolean;
  pendingEmail: string | null;
  hasBoutique: boolean;
  hasNumeroPaiement: boolean;
  skipPaiement: boolean;
  completed: boolean;
};

export const isOnboardingStepId = (value: string): value is OnboardingStepId =>
  ONBOARDING_STEPS.some((step) => step.id === value);

export const getOnboardingStep = (id: OnboardingStepId) =>
  ONBOARDING_STEPS.find((step) => step.id === id)!;

export const resolveOnboardingStep = (snapshot: OnboardingSnapshot): OnboardingStepId | 'dashboard' => {
  if (!snapshot.isAuthenticated) {
    if (snapshot.pendingEmail) return 'verif';
    return 'compte';
  }

  if (!snapshot.hasBoutique) return 'boutique';
  if (!snapshot.hasNumeroPaiement && !snapshot.skipPaiement) return 'paiement';
  if (!snapshot.completed) return 'done';
  return 'dashboard';
};

export const canVisitOnboardingStep = (
  requested: OnboardingStepId,
  snapshot: OnboardingSnapshot
): boolean => {
  const resolved = resolveOnboardingStep(snapshot);
  if (resolved === 'dashboard') return requested === 'done';

  const requestedIndex = getOnboardingStep(requested).index;
  const resolvedIndex = getOnboardingStep(resolved).index;

  if (requested === 'verif' && snapshot.pendingEmail && !snapshot.isAuthenticated) {
    return true;
  }

  if (requested === 'compte' && snapshot.isAuthenticated) {
    return false;
  }

  return requestedIndex <= resolvedIndex;
};
