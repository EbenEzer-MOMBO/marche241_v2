import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/HeroSection';
import TrendingByCategory from '@/components/TrendingByCategory';
import { getBoutiqueConfig, type BoutiqueConfig } from '@/lib/boutiques';
import { notFound } from 'next/navigation';

// Force le mode dynamique pour éviter les erreurs de génération statique
export const dynamic = 'force-dynamic';

interface BoutiquePageProps {
  params: Promise<{
    boutique: string;
  }>;
}

export default async function BoutiquePage({ params }: BoutiquePageProps) {
  const { boutique } = await params;
  
  let boutiqueConfig: BoutiqueConfig;
  try {
    boutiqueConfig = await getBoutiqueConfig(boutique);
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    notFound();
  }

  return (
    <MainLayout boutiqueName={boutique}>
      <HeroSection boutiqueName={boutique} />
      <TrendingByCategory boutiqueName={boutique} />
    </MainLayout>
  );
}
