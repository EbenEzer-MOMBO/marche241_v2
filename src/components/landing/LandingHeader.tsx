'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Marche241Logo } from '@/components/Marche241Logo';

interface LandingHeaderProps {
  isAuthenticated?: boolean;
  boutiqueSlug?: string | null;
  activePage?: 'home' | 'boutiques';
}

const navLinkClass =
  'text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium';

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  isAuthenticated = false,
  boutiqueSlug = null,
  activePage = 'home',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-10">
        <nav className="flex items-center justify-between h-[68px]">
          <div className="flex items-center gap-8">
            <Marche241Logo iconHeight={36} textHeight={26} priority />

            <div className="hidden md:flex items-center gap-6">
              {activePage === 'boutiques' ? (
                <>
                  <Link href="/" className={navLinkClass}>
                    Accueil
                  </Link>
                  <Link
                    href="/affiche_boutiques"
                    className="text-sm font-semibold text-gray-900 border-b-2 border-[#508e27] pb-0.5"
                  >
                    Boutiques
                  </Link>
                  <Link href="/#faq" className={navLinkClass}>
                    FAQ
                  </Link>
                </>
              ) : (
                <>
                  <a href="#how-it-works" className={navLinkClass}>
                    Comment ça marche
                  </a>
                  <a href="#features" className={navLinkClass}>
                    Fonctionnalités
                  </a>
                  <Link href="/affiche_boutiques" className={navLinkClass}>
                    Boutiques
                  </Link>
                  <a href="#faq" className={navLinkClass}>
                    FAQ
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated && boutiqueSlug ? (
              <Link
                href={`/admin/${boutiqueSlug}`}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-[11px] hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Mon dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/admin/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-[11px] font-semibold text-sm shadow-[0_6px_16px_rgba(80,142,39,0.28)] hover:opacity-95 transition-all"
                >
                  Créer ma boutique
                  <span className="text-[11px] font-semibold bg-white/22 px-1.5 py-0.5 rounded-md">
                    gratuit
                  </span>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            {!isAuthenticated && (
              <Link
                href="/admin/login"
                className="text-sm text-gray-500 font-medium"
              >
                Connexion
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {activePage === 'boutiques' ? (
                <>
                  <Link href="/" className={navLinkClass} onClick={handleCloseMenu}>
                    Accueil
                  </Link>
                  <Link href="/affiche_boutiques" className={navLinkClass} onClick={handleCloseMenu}>
                    Boutiques
                  </Link>
                  <Link href="/#faq" className={navLinkClass} onClick={handleCloseMenu}>
                    FAQ
                  </Link>
                </>
              ) : (
                <>
                  <a href="#how-it-works" className={navLinkClass} onClick={handleCloseMenu}>
                    Comment ça marche
                  </a>
                  <a href="#features" className={navLinkClass} onClick={handleCloseMenu}>
                    Fonctionnalités
                  </a>
                  <Link href="/affiche_boutiques" className={navLinkClass} onClick={handleCloseMenu}>
                    Boutiques
                  </Link>
                  <a href="#faq" className={navLinkClass} onClick={handleCloseMenu}>
                    FAQ
                  </a>
                </>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated && boutiqueSlug ? (
                  <Link
                    href={`/admin/${boutiqueSlug}`}
                    className="block w-full px-6 py-2.5 bg-gray-900 text-white rounded-[11px] font-medium text-center"
                    onClick={handleCloseMenu}
                  >
                    Mon dashboard
                  </Link>
                ) : (
                  <Link
                    href="/admin/register"
                    className="flex w-full items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-[11px] font-semibold"
                    onClick={handleCloseMenu}
                  >
                    Créer ma boutique
                    <span className="text-[11px] font-semibold bg-white/22 px-1.5 py-0.5 rounded-md">
                      gratuit
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
