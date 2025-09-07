import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/HeroSection';
import TrendingByCategory from '@/components/TrendingByCategory';
import { boutiques, type BoutiqueConfig } from '@/lib/boutiques';
import { notFound } from 'next/navigation';

interface BoutiquePageProps {
  params: Promise<{
    boutique: string;
  }>;
}

export default async function BoutiquePage({ params }: BoutiquePageProps) {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    notFound();
  }

  return (
    <MainLayout boutiqueConfig={boutiqueConfig} boutiqueName={boutique}>
      <HeroSection boutiqueConfig={boutiqueConfig} />
      <TrendingByCategory boutiqueConfig={boutiqueConfig} boutiqueName={boutique} />
    </MainLayout>
  );
}

// Génération statique des routes pour les boutiques connues
export async function generateStaticParams() {
  return Object.keys(boutiques).map((boutique) => ({
    boutique,
  }));
}