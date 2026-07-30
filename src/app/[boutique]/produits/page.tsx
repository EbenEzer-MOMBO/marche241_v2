import type { Metadata } from 'next';
import { getBoutiqueConfig, getBoutiqueBySlug } from '@/lib/boutiques';
import { absoluteUrl, OG_LOCALE } from '@/lib/seo';
import ProduitsPageClient from './ProduitsPageClient';

export const dynamic = 'force-dynamic';

interface ProduitsPageProps {
  params: Promise<{ boutique: string }>;
}

export async function generateMetadata({
  params,
}: ProduitsPageProps): Promise<Metadata> {
  const { boutique } = await params;

  try {
    const [boutiqueConfig, boutiqueData] = await Promise.all([
      getBoutiqueConfig(boutique),
      getBoutiqueBySlug(boutique),
    ]);

    const description = boutiqueData.description
      ? boutiqueData.description.length > 160
        ? `${boutiqueData.description.substring(0, 157)}...`
        : boutiqueData.description
      : `Catalogue des produits de ${boutiqueConfig.name} sur Marché241`;

    const url = absoluteUrl(`/${boutique}/produits`);

    return {
      title: `Tous les produits - ${boutiqueConfig.name}`,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `Tous les produits - ${boutiqueConfig.name}`,
        description,
        url,
        locale: OG_LOCALE,
        type: 'website',
        siteName: boutiqueConfig.name,
      },
    };
  } catch (error) {
    console.error('Erreur métadonnées catalogue produits:', error);
    return {
      title: 'Catalogue produits',
      description: 'Catalogue de produits Marché241',
    };
  }
}

export default async function ProduitsPage({ params }: ProduitsPageProps) {
  await params;
  return <ProduitsPageClient />;
}
