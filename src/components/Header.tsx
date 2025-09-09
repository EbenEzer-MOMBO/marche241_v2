'use client';

import Link from 'next/link';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useBoutique } from '@/hooks/useBoutique';
import { HeaderSkeleton } from './LoadingStates';
import SafeImage from './SafeImage';
import { BoutiqueConfig } from '@/lib/boutiques';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  cartItemsCount?: number;
  boutiqueName: string;
  hideCartButton?: boolean;
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

export default function Header({ onMenuClick, onCartClick, cartItemsCount = 0, boutiqueName, hideCartButton = false }: HeaderProps) {
  const scrollY = useScrollPosition();
  const { boutique, config, loading, error } = useBoutique(boutiqueName);
  
  // Le logo du hero devient invisible après 300px de scroll (mobile uniquement)
  const showMobileNavbarLogo = scrollY > 300;

  // Afficher le squelette pendant le chargement
  if (loading) {
    return <HeaderSkeleton />;
  }

  // En cas d'erreur, afficher un header minimal
  if (error || !config) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-lg font-bold text-red-600">Erreur de chargement</span>
            </div>
            <div className="text-sm text-red-600">Boutique introuvable</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Section gauche */}
          <div className="flex items-center">
            {/* Menu hamburger (mobile/tablet) */}
            <button
              type="button"
              className="lg:hidden text-primary hover:text-secondary focus:outline-none focus:text-secondary mr-3"
              aria-label="Menu"
              onClick={onMenuClick}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {/* Logo fixe desktop - toujours visible */}
            <Link href={`/${boutiqueName}`} className="hidden lg:flex items-center space-x-2">
              <SafeImage
                src={getBoutiqueLogo(boutique?.logo)}
                alt={`${config.name} Logo`}
                width={40}
                height={40}
                className="rounded-lg object-cover"
                priority
              />
              <span className="text-xl font-bold text-primary">
                {config.name}
              </span>
            </Link>
          </div>

          {/* Logo mobile qui apparaît au scroll */}
          <div className="lg:hidden flex-1 flex justify-center">
            <Link 
              href={`/${boutiqueName}`} 
              className={`flex items-center space-x-2 transition-all duration-300 ${
                showMobileNavbarLogo 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-accent">
                <SafeImage
                  src={getBoutiqueLogo(boutique?.logo)}
                  alt={`${config.name} Logo`}
                  width={20}
                  height={20}
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <span className="text-sm font-bold text-primary">
                {config.name}
              </span>
            </Link>
          </div>

          
          {/* Actions à droite */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="text-black hover:text-secondary transition-colors duration-200"
              aria-label="Rechercher"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            
            {!hideCartButton && (
              <button
                type="button"
                className="text-black hover:text-secondary transition-colors duration-200 relative"
                aria-label="Panier"
                onClick={onCartClick}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 0L5 3H3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6m-10 0v-2a1 1 0 011-1h8a1 1 0 011 1v2"></path>
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
