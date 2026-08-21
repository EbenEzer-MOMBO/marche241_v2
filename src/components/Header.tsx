'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useBoutique } from '@/hooks/useBoutique';
import { usePanier } from '@/hooks/usePanier';
import { HeaderSkeleton } from './LoadingStates';
import SafeImage from './SafeImage';

interface HeaderProps {
  onCartClick?: () => void;
  boutiqueName: string;
  hideCartButton?: boolean;
}

const getBoutiqueLogo = (logoUrl?: string | null): string => {
  if (logoUrl && logoUrl.trim() !== '') {
    try {
      new URL(logoUrl);
      return logoUrl;
    } catch {
      return '/default-shop.png';
    }
  }
  return '/default-shop.png';
};

export default function Header({
  onCartClick,
  boutiqueName,
  hideCartButton = false,
}: HeaderProps) {
  const scrollY = useScrollPosition();
  const { boutique, config, loading, error } = useBoutique(boutiqueName);
  const { totalItems, rafraichir } = usePanier(boutique?.id);
  const showBrand = scrollY > 180;

  useEffect(() => {
    rafraichir();
  }, [rafraichir]);

  if (loading) {
    return <HeaderSkeleton />;
  }

  if (error || !config) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ececea] bg-white">
        <div className="mx-auto flex h-[54px] max-w-7xl items-center justify-between px-4 sm:h-[60px] sm:px-8">
          <span className="text-sm font-medium text-[#b3261e]">
            Boutique introuvable
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ececea] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[54px] max-w-7xl items-center justify-between px-4 sm:h-[60px] sm:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href={`/${boutiqueName}`}
            className={`flex items-center gap-2.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30 rounded sm:gap-3 ${
              showBrand
                ? 'opacity-100 translate-y-0'
                : 'pointer-events-none opacity-0 -translate-y-1'
            }`}
            aria-label={`Accueil ${config.name}`}
            tabIndex={showBrand ? 0 : -1}
            aria-hidden={!showBrand}
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm sm:h-[30px] sm:w-[30px] sm:rounded-lg sm:border-0 sm:shadow-none">
              <SafeImage
                src={getBoutiqueLogo(boutique?.logo)}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="max-w-[140px] truncate text-sm font-semibold text-[#17181a] sm:max-w-none sm:text-base">
              {config.name}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            href={`/${boutiqueName}/produits`}
            className="text-[14px] text-[#5f6369] hover:text-[#17181a] focus:outline-none focus-visible:underline"
            aria-label="Rechercher des produits"
          >
            <span className="hidden sm:inline">Rechercher</span>
            <MagnifyingGlass size={18} className="sm:hidden" />
          </Link>

          {!hideCartButton && (
            <button
              type="button"
              className="flex items-center gap-2 text-[14px] font-medium text-[#17181a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30 rounded"
              aria-label="Panier"
              onClick={onCartClick}
            >
              <span>Panier</span>
              {totalItems > 0 && (
                <span
                  className="inline-flex min-w-[18px] items-center justify-center rounded-[9px] px-1.5 font-mono text-[10px] font-medium leading-[18px] sm:min-w-5 sm:text-[11px] sm:leading-5"
                  style={{
                    backgroundColor:
                      'var(--color-shop-primary, var(--primary-color))',
                    color: 'var(--shop-cta-fg, #fff)',
                  }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
