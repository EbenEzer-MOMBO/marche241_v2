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

// Génération statique des routes pour les boutiques connues
// Note: En production, cette fonction pourrait récupérer la liste depuis l'API
// Temporairement désactivé pour forcer le mode dynamique
/* 
export async function generateStaticParams() {
  // Pour l'instant, on garde les slugs connus
  // TODO: Récupérer depuis l'API en production
  return [
    { boutique: 'marche_241' },
    { boutique: 'boutique_de_joline' }
  ];
}
*/