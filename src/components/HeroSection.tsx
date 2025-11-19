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
    <section className="relative pt-10 pb-10">
      {/* Stack avec fond vert */}
      <div className="relative">
        {/* Bloc vert */}
        <div className="bg-black h-70 sm:h-70 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center text-white">
              {/* Titre principal */}
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4">
                Bienvenue sur{' '}
                <span className="text-accent">{config.name}</span>
              </h1>
              
              {/* Sous-titre */}
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>
          
          {/* Logo rond centré sur la bordure inférieure */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-28 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-accent">
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
        
      </div>
    </section>
  );
}
