'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StickyMobileCtaProps {
  boutiqueCount?: number;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({ boutiqueCount = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-3 bg-white/96 border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/register"
          className="flex-1 flex items-center justify-center h-[52px] rounded-xl bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white font-bold text-base shadow-[0_8px_20px_rgba(80,142,39,0.35)]"
          aria-label="Créer ma boutique"
        >
          Créer ma boutique
        </Link>
        <Link
          href="/affiche_boutiques"
          className="w-24 flex items-center justify-center h-[52px] rounded-xl border border-gray-300 text-sm font-medium text-gray-700"
          aria-label={boutiqueCount > 0 ? `Voir les ${boutiqueCount} boutiques` : 'Voir les boutiques'}
        >
          Boutiques
        </Link>
      </div>
    </div>
  );
};
