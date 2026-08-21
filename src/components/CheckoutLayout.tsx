'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { BoutiqueFooter } from './storefront/BoutiqueFooter';
import { BoutiqueConfig } from '@/lib/boutiques';

interface CheckoutLayoutProps {
  children: ReactNode;
  boutiqueConfig?: BoutiqueConfig;
  boutiqueName?: string;
}

export default function CheckoutLayout({
  children,
  boutiqueConfig,
  boutiqueName,
}: CheckoutLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-[#17181a]">
      <div className="sticky top-0 z-50 border-b border-[#ececea] bg-white">
        <div className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link
            href={boutiqueName ? `/${boutiqueName}` : '/'}
            className="inline-flex items-center gap-2 text-[14px] text-[#5f6369] hover:text-[#17181a] focus:outline-none focus-visible:underline"
          >
            <span aria-hidden>←</span>
            <span className="font-medium">Continuer mes achats</span>
          </Link>
          <div className="hidden text-[13.5px] text-[#8b8f95] sm:block">
            <span className="text-[#17181a]">✓ Articles</span>
            <span className="mx-2">—</span>
            <span className="font-medium text-[#17181a]">2 Livraison</span>
            <span className="mx-2">—</span>
            <span>3 Paiement</span>
          </div>
          {boutiqueConfig?.name && (
            <span className="max-w-[140px] truncate text-[13px] font-semibold text-[#17181a] sm:max-w-none">
              {boutiqueConfig.name}
            </span>
          )}
        </div>
      </div>

      <main>{children}</main>

      <BoutiqueFooter />
    </div>
  );
}
