'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Footer from './Footer';
import { BoutiqueConfig } from '@/lib/boutiques';

interface CheckoutLayoutProps {
  children: ReactNode;
  boutiqueConfig?: BoutiqueConfig;
  boutiqueName?: string;
}

export default function CheckoutLayout({ children, boutiqueConfig, boutiqueName }: CheckoutLayoutProps) {

  return (
    <div className="min-h-screen bg-white">
      {/* Bouton Home simple */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href={boutiqueName ? `/${boutiqueName}` : "/"}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Retour à l'accueil</span>
          </Link>
        </div>
      </div>
      
      {/* Contenu principal */}
      <main>
        {children}
      </main>
      
      {/* Footer sans marge pour sidebar */}
      <div className="transition-all duration-300">
        <Footer />
      </div>
    </div>
  );
}
