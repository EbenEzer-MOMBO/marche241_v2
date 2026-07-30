import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoutiqueConfig, getBoutiqueBySlug, type BoutiqueConfig } from "@/lib/boutiques";
import {
  absoluteAssetUrl,
  absoluteUrl,
  buildStoreJsonLd,
  OG_LOCALE,
} from "@/lib/seo";

// Force le mode dynamique pour éviter les erreurs de génération statique
export const dynamic = 'force-dynamic';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boutique: string }>;
}): Promise<Metadata> {
  const { boutique } = await params;
  
  if (isReservedOrAsset(boutique)) {
    return {
      title: "Boutique non trouvée",
      description: "Cette boutique n'existe pas"
    };
  }
  
  try {
    // Récupérer les données complètes de la boutique pour le logo
    const boutiqueData = await getBoutiqueBySlug(boutique);
    const boutiqueConfig = await getBoutiqueConfig(boutique);
    
    // Préparer la description (limitée à 160 caractères pour l'OpenGraph)
    const description = boutiqueData.description 
      ? (boutiqueData.description.length > 160 
          ? boutiqueData.description.substring(0, 157) + '...' 
          : boutiqueData.description)
      : `Découvrez ${boutiqueConfig.name} - Boutique en ligne`;
    
    const logoUrl = absoluteAssetUrl(boutiqueData.logo);
    const boutiqueUrl = absoluteUrl(`/${boutique}`);
    
    return {
      title: `${boutiqueConfig.name} - Boutique en ligne`,
      description: description,
      alternates: {
        canonical: boutiqueUrl,
      },
      openGraph: {
        title: `${boutiqueConfig.name} - Boutique en ligne`,
        description: description,
        url: boutiqueUrl,
        siteName: boutiqueConfig.name,
        images: [
          {
            url: logoUrl,
            width: 400,
            height: 400,
            alt: `${boutiqueConfig.name} Logo`,
          },
        ],
        locale: OG_LOCALE,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${boutiqueConfig.name} - Boutique en ligne`,
        description: description,
        images: [logoUrl],
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: "Boutique non trouvée",
      description: "Cette boutique n'existe pas"
    };
  }
}

export default async function BoutiqueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boutique: string }>;
}) {
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

  const storeJsonLd = buildStoreJsonLd(boutiqueData, boutique);

  return (
    <div 
      className="boutique-container"
      style={{
        '--primary-color': boutiqueConfig.theme.primary,
        '--secondary-color': boutiqueConfig.theme.secondary,
        '--accent-color': boutiqueConfig.theme.accent,
      } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      {children}
    </div>
  );
}
