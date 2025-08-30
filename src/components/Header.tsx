'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { BoutiqueConfig } from '@/app/[boutique]/layout';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  cartItemsCount?: number;
  boutiqueConfig?: BoutiqueConfig;
  boutiqueName?: string;
}

export default function Header({ onMenuClick, onCartClick, cartItemsCount = 0, boutiqueConfig, boutiqueName }: HeaderProps) {
  const scrollY = useScrollPosition();
  
  // Le logo du hero devient invisible après 300px de scroll (mobile uniquement)
  const showMobileNavbarLogo = scrollY > 300;

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
            <Link href={boutiqueName ? `/${boutiqueName}` : "/"} className="hidden lg:flex items-center space-x-2">
              <Image
                src="/site-logo.png"
                alt={`${boutiqueConfig?.name || 'Marché241'} Logo`}
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
              <span className="text-xl font-bold text-primary">
                Marché241
              </span>
            </Link>
          </div>

          {/* Logo mobile qui apparaît au scroll */}
          <div className="lg:hidden flex-1 flex justify-center">
            <Link 
              href="/" 
              className={`flex items-center space-x-2 transition-all duration-300 ${
                showMobileNavbarLogo 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-accent">
                <Image
                  src="/site-logo.png"
                  alt="Marché241 Logo"
                  width={20}
                  height={20}
                  className="rounded-full"
                  priority
                />
              </div>
              <span className="text-sm font-bold text-primary">
                Marché241
              </span>
            </Link>
          </div>

          
          {/* Actions à droite */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="text-primary hover:text-secondary transition-colors duration-200"
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
            
            <button
              type="button"
              className="text-primary hover:text-secondary transition-colors duration-200 relative"
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
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
