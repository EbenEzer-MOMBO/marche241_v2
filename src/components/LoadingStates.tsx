/**
 * Composants d'états de chargement spécialisés pour l'application
 */

import { Skeleton, SkeletonText, SkeletonCircle } from './ui/Skeleton';

/**
 * Squelette pour le Header
 */
export function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ececea] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[54px] max-w-7xl items-center justify-between px-4 sm:h-[60px] sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <SkeletonCircle size="h-8 w-8 sm:h-[30px] sm:w-[30px]" />
          <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
        </div>
        <div className="flex items-center gap-4 sm:gap-5">
          <Skeleton className="h-[18px] w-[18px] sm:h-4 sm:w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </header>
  );
}

/**
 * Squelette pour le HeroSection
 */
export function HeroSkeleton() {
  return (
    <section className="border-b border-[#ececea]">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="relative">
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-gray-200 sm:rounded-3xl"
            style={{ paddingBottom: 'clamp(28%, 26vw, 26%)' }}
          >
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          </div>
          <div className="absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 sm:-bottom-12">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28">
              <SkeletonCircle size="h-full w-full" />
            </div>
          </div>
        </div>

        <div className="mt-14 pb-5 text-center sm:mt-16 sm:pb-7">
          <Skeleton className="mx-auto mb-2 h-8 w-48 sm:mb-3 sm:h-9 sm:w-64" />
          <div className="mx-auto max-w-3xl px-1">
            <SkeletonText lines={2} />
          </div>
          <div className="mx-auto mt-4 hidden max-w-3xl justify-center gap-x-6 sm:mt-5 sm:flex">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-6">
                {i > 1 && <div className="hidden min-h-[36px] w-px bg-[#ececea] sm:block" />}
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 flex max-w-3xl justify-center gap-2 sm:hidden">
            <Skeleton className="h-7 w-28 rounded-[7px]" />
            <Skeleton className="h-7 w-24 rounded-[7px]" />
            <Skeleton className="h-7 w-20 rounded-[7px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * État d'erreur élégant
 */
export function ErrorState({ 
  title = "Une erreur s'est produite",
  message = "Impossible de charger les données de la boutique",
  onRetry
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Overlay de chargement pour les transitions
 */
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
