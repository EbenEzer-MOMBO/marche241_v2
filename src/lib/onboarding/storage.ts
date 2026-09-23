import { ONBOARDING_STORAGE } from './steps';

const readFlag = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) === '1';
};

const writeFlag = (key: string, value: boolean) => {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(key, '1');
  } else {
    window.localStorage.removeItem(key);
  }
};

export const getPendingOnboardingEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(ONBOARDING_STORAGE.pendingEmail);
};

export const setPendingOnboardingEmail = (email: string) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ONBOARDING_STORAGE.pendingEmail, email);
  window.sessionStorage.setItem(ONBOARDING_STORAGE.pending, '1');
};

export const clearPendingOnboardingEmail = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ONBOARDING_STORAGE.pendingEmail);
  window.sessionStorage.removeItem(ONBOARDING_STORAGE.pending);
};

export const markOnboardingActive = (userId: string) => {
  writeFlag(`${ONBOARDING_STORAGE.activePrefix}${userId}`, true);
};

export const isOnboardingActive = (userId: string): boolean =>
  readFlag(`${ONBOARDING_STORAGE.activePrefix}${userId}`);

export const markOnboardingCompleted = (userId: string) => {
  writeFlag(`${ONBOARDING_STORAGE.completedPrefix}${userId}`, true);
  writeFlag(`${ONBOARDING_STORAGE.activePrefix}${userId}`, false);
};

export const isOnboardingCompleted = (userId: string): boolean =>
  readFlag(`${ONBOARDING_STORAGE.completedPrefix}${userId}`);

export const markPaiementSkipped = (userId: string) => {
  writeFlag(`${ONBOARDING_STORAGE.skipPaiementPrefix}${userId}`, true);
};

export const isPaiementSkipped = (userId: string): boolean =>
  readFlag(`${ONBOARDING_STORAGE.skipPaiementPrefix}${userId}`);

export const markProduitsSkipped = (userId: string) => {
  writeFlag(`${ONBOARDING_STORAGE.skipProduitsPrefix}${userId}`, true);
};

export const isProduitsSkipped = (userId: string): boolean =>
  readFlag(`${ONBOARDING_STORAGE.skipProduitsPrefix}${userId}`);

export const markWelcomeSent = (userId: string) => {
  writeFlag(`${ONBOARDING_STORAGE.welcomeSentPrefix}${userId}`, true);
};

export const isWelcomeSent = (userId: string): boolean =>
  readFlag(`${ONBOARDING_STORAGE.welcomeSentPrefix}${userId}`);
