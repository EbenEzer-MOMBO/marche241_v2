'use client';

import Link from 'next/link';
import { useBoutique } from '@/hooks/useBoutique';
import { HeroSkeleton, ErrorState } from './LoadingStates';
import SafeImage from './SafeImage';
import { BoutiqueConfig } from '@/lib/boutiques';

interface HeroSectionProps {
  boutiqueName: string;
}

/**
 * Utilitaire pour obtenir l'URL du logo de la boutique
 */
function getBoutiqueLogo(logoUrl?: string | null): string {
  if (logoUrl && logoUrl.trim() !== '') {
    // Vérifier si l'URL est valide
    try {
      new URL(logoUrl);
      return logoUrl;
    } catch {
      // Si l'URL n'est pas valide, utiliser l'image par défaut
      console.warn('URL de logo invalide:', logoUrl);
      return '/default-shop.png';
    }
  }
  return '/default-shop.png';
}

export default function HeroSection({ boutiqueName }: HeroSectionProps) {
  const { boutique, config, loading, error, refetch } = useBoutique(boutiqueName);

  // Afficher le squelette pendant le chargement
  if (loading) {
    return <HeroSkeleton />;
  }

  // En cas d'erreur, afficher l'état d'erreur
  if (error || !config) {
    return (
      <ErrorState 
        title="Boutique introuvable"
        message={error || "Impossible de charger les informations de la boutique"}
        onRetry={refetch}
      />
    );
  }
  return (
    <section className="relative py-6 sm:py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container principal */}
        <div className="relative">
          {/* Bannière avec hauteur adaptative (plus haute sur mobile) */}
          <div 
            className="relative w-full rounded-3xl overflow-hidden" 
            style={{ 
              paddingBottom: 'clamp(30%, 28.125vw, 28.125%)' 
            }}
          >
            {/* Image de bannière */}
            {boutique?.banniere ? (
              <SafeImage
                src={boutique.banniere}
                alt={`${config.name} Bannière`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              // Fallback avec dégradé si pas de bannière
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
            )}
            
            {/* Overlay léger pour améliorer le contraste */}
            <div className="absolute inset-0 bg-black/5" />
          </div>
          
          {/* Logo rond centré sur la bordure inférieure de la bannière */}
          <div className="absolute -bottom-12 sm:-bottom-14 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
              <SafeImage
                src={getBoutiqueLogo(boutique?.logo)}
                alt={`${config.name} Logo`}
                width={100}
                height={100}
                className="rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Contenu texte en dessous du logo */}
        <div className="mt-16 sm:mt-20 text-center">
          {/* Titre principal */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            {config.name}
          </h1>
          
          {/* Description */}
          <p className="text-base sm:text-md lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {config.description}
          </p>
        </div>
      </div>
    </section>
  );
}
