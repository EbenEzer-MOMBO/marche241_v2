import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoutiqueConfig, type BoutiqueConfig } from "@/lib/boutiques";

// Force le mode dynamique pour éviter les erreurs de génération statique
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boutique: string }>;
}): Promise<Metadata> {
  const { boutique } = await params;
  
  try {
    const boutiqueConfig = await getBoutiqueConfig(boutique);
    return {
      title: `${boutiqueConfig.name} - Boutique en ligne`,
      description: boutiqueConfig.description,
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