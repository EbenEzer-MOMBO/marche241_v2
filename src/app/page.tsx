'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { NewsletterSection } from '@/components/landing/NewsletterSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { ScreenshotsSection } from '@/components/landing/ScreenshotsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [boutiqueSlug, setBoutiqueSlug] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('admin_token');
    const boutiqueData = localStorage.getItem('admin_boutique');
    
    if (token) {
      setIsAuthenticated(true);
      
      // Récupérer le slug de la boutique si disponible
      if (boutiqueData) {
        try {
          const parsedBoutique = JSON.parse(boutiqueData);
          const slug = parsedBoutique.slug;
          setBoutiqueSlug(slug);
          
          // Rediriger automatiquement vers le dashboard
          console.log('🔄 Redirection automatique vers le dashboard:', `/admin/${slug}`);
          router.push(`/admin/${slug}`);
          return; // Ne pas afficher la landing page
        } catch (error) {
          console.error('Erreur lors du parsing des données de la boutique:', error);
        }
      }
    }
    
    // Si pas authentifié ou pas de boutique, afficher la landing page
    setIsRedirecting(false);
  }, [router]);

  // Afficher un loader pendant la redirection
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/marche241_Web_with_text-01.svg" 
                alt="Marché241" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Menu Desktop et CTA Buttons */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                À propos
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Tarifs
              </a>
              <a href="/affiche_boutiques" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Boutiques
              </a>
              
              {/* Séparateur */}
              <div className="h-6 w-px bg-gray-300"></div>
              
              {/* CTA Buttons */}
              {isAuthenticated && boutiqueSlug ? (
                <Link
                  href={`/admin/${boutiqueSlug}`}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Mon dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/admin/login"
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/admin/register"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Créer ma boutique
                  </Link>
                </>
              )}
            </div>

            {/* Menu Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>

          {/* Menu Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a 
                  href="#about" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  À propos
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tarifs
                </a>
                <a 
                  href="/affiche_boutiques" 
                  className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Boutiques
                </a>
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {isAuthenticated && boutiqueSlug ? (
                    <Link
                      href={`/admin/${boutiqueSlug}`}
                      className="block w-full px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-center"
                    >
                      Mon dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/admin/login"
                        className="block w-full px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium text-center"
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/admin/register"
                        className="block w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                      >
                        Créer ma boutique
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pt-20">
        <HeroBanner />
        <FeaturesSection />
        <AboutSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

