/**
 * Composants d'états de chargement spécialisés pour l'application
 */

import { Skeleton, SkeletonText, SkeletonCircle, SkeletonButton } from './ui/Skeleton';

/**
 * Squelette pour le Header
 */
export function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Section gauche */}
          <div className="flex items-center">
            {/* Menu hamburger (mobile/tablet) */}
            <div className="lg:hidden mr-3">
              <Skeleton className="h-6 w-6" />
            </div>

            {/* Logo desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <SkeletonCircle size="w-10 h-10" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          {/* Logo mobile centré */}
          <div className="lg:hidden flex-1 flex justify-center">
            <div className="flex items-center space-x-2 opacity-50">
              <SkeletonCircle size="w-8 h-8" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-5" />
          </div>
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
    <section className="relative pt-10 pb-10">
      <div className="relative">
        {/* Bloc de fond */}
        <div className="bg-gray-900 h-70 sm:h-70 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center">
              {/* Titre principal */}
              <div className="mb-4">
                <Skeleton className="h-10 w-96 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-10 w-72 mx-auto bg-white/10" />
              </div>
              
              {/* Sous-titre */}
              <div className="max-w-2xl mx-auto">
                <Skeleton className="h-6 w-full mb-2 bg-white/10" />
                <Skeleton className="h-6 w-3/4 mx-auto bg-white/10" />
              </div>
            </div>
          </div>
          
          {/* Logo rond centré */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200">
              <SkeletonCircle size="w-20 h-20" className="bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Section claire */}
        <div className="bg-background pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Description */}
              <div className="max-w-3xl mx-auto mb-8">
                <SkeletonText lines={2} />
              </div>
              
              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SkeletonButton className="w-full sm:w-auto" />
                <SkeletonButton className="w-full sm:w-auto" />
              </div>
            </div>
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
