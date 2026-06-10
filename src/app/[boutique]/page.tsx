import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/HeroSection';
import TrendingByCategory from '@/components/TrendingByCategory';
import SocialShareSection from '@/components/SocialShareSection';
import { getBoutiqueConfig, getBoutiqueBySlug, type BoutiqueConfig } from '@/lib/boutiques';
import { notFound } from 'next/navigation';

const reservedSlugs = ['admin', 'affiche_boutiques', 'promo-poster', 'favicon.ico', 'manifest.json', 'robots.txt'];

function isReservedOrAsset(slug: string): boolean {
  if (!slug) {
    return true;
  }
  if (reservedSlugs.includes(slug.toLowerCase())) {
    return true;
  }
  if (slug.includes('.')) {
    return true;
  }
  return false;
}

// Force le mode dynamique pour éviter les erreurs de génération statique
export const dynamic = 'force-dynamic';

interface BoutiquePageProps {
  params: Promise<{
    boutique: string;
  }>;
}

export default async function BoutiquePage({ params }: BoutiquePageProps) {
  const { boutique } = await params;
  
  if (isReservedOrAsset(boutique)) {
    notFound();
  }
  
  let boutiqueConfig: BoutiqueConfig;
  let boutiqueData;
  
  try {
    boutiqueConfig = await getBoutiqueConfig(boutique);
    boutiqueData = await getBoutiqueBySlug(boutique);
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    notFound();
  }

  return (
    <MainLayout boutiqueName={boutique}>
      <HeroSection boutiqueName={boutique} />
      <TrendingByCategory boutiqueName={boutique} />
      <SocialShareSection 
        boutiqueName={boutique}
        boutiqueTitle={boutiqueConfig.name}
        boutiqueDescription={boutiqueData.description || `Découvrez ${boutiqueConfig.name}`}
      />
    </MainLayout>
  );
}
