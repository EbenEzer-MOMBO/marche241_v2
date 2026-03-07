import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoutiqueConfig, getBoutiqueBySlug, type BoutiqueConfig } from "@/lib/boutiques";

// Force le mode dynamique pour éviter les erreurs de génération statique
export const dynamic = 'force-dynamic';

/**
 * Utilitaire pour obtenir l'URL complète du logo de la boutique
 */
function getBoutiqueLogoUrl(logoUrl?: string | null): string {
  if (logoUrl && logoUrl.trim() !== '') {
    // Vérifier si l'URL est déjà absolue
    try {
      new URL(logoUrl);
      return logoUrl;
    } catch {
      // Si relative, créer une URL absolue (pour l'OpenGraph)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${logoUrl}`;
    }
  }
  // Logo par défaut
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/default-shop.png`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boutique: string }>;
}): Promise<Metadata> {
  const { boutique } = await params;
  
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
    
    // URL du logo pour OpenGraph
    const logoUrl = getBoutiqueLogoUrl(boutiqueData.logo);
    
    // URL de la boutique
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const boutiqueUrl = `${baseUrl}/${boutique}`;
    
    return {
      title: `${boutiqueConfig.name} - Boutique en ligne`,
      description: description,
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
        locale: 'fr_FR',
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
  
  let boutiqueConfig: BoutiqueConfig;
  try {
    boutiqueConfig = await getBoutiqueConfig(boutique);
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    notFound();
  }

  return (
    <div 
      className="boutique-container"
      style={{
        '--primary-color': boutiqueConfig.theme.primary,
        '--secondary-color': boutiqueConfig.theme.secondary,
        '--accent-color': boutiqueConfig.theme.accent,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}