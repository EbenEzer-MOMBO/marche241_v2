'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroBanner } from '@/components/landing/HeroBanner';
import { BoutiqueLogoStrip } from '@/components/landing/BoutiqueLogoStrip';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { MoneySection } from '@/components/landing/MoneySection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { SocialMediaSection } from '@/components/landing/SocialMediaSection';
import { StickyMobileCta } from '@/components/landing/StickyMobileCta';
import Footer from '@/components/Footer';
import { InstallAppButton } from '@/components/InstallAppButton';
import { useLandingBoutiques } from '@/hooks/useLandingBoutiques';

/**
 * Contenu marketing toujours rendu (SEO / LCP).
 * La redirection dashboard se fait en arrière-plan si l'utilisateur est déjà connecté.
 */
export default function LandingHomeClient() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [boutiqueSlug, setBoutiqueSlug] = useState<string | null>(null);
  const { boutiques, count } = useLandingBoutiques();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const boutiqueData = localStorage.getItem('admin_boutique');

    if (!token) {
      return;
    }

    setIsAuthenticated(true);

    if (!boutiqueData) {
      return;
    }

    try {
      const parsedBoutique = JSON.parse(boutiqueData);
      const slug = parsedBoutique.slug as string | undefined;
      if (!slug) {
        return;
      }
      setBoutiqueSlug(slug);
      router.push(`/admin/${slug}`);
    } catch (error) {
      console.error('Erreur lors du parsing des données de la boutique:', error);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      <LandingHeader
        isAuthenticated={isAuthenticated}
        boutiqueSlug={boutiqueSlug}
        activePage="home"
      />

      <main className="pt-[68px]">
        <HeroBanner boutiqueCount={count} featuredBoutiques={boutiques} />
        <BoutiqueLogoStrip boutiques={boutiques} />
        <HowItWorksSection boutiqueCount={count} />
        <FeaturesSection />
        <MoneySection />
        <FAQSection />
        <CTASection boutiqueCount={count} />
      </main>

      <SocialMediaSection />
      <Footer />

      <InstallAppButton className="bottom-24 md:bottom-6" />
      <StickyMobileCta boutiqueCount={count} />
    </div>
  );
}
