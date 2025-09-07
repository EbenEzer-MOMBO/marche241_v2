import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { boutiques, type BoutiqueConfig } from "@/lib/boutiques";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boutique: string }>;
}): Promise<Metadata> {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    return {
      title: "Boutique non trouvée",
      description: "Cette boutique n'existe pas"
    };
  }

  return {
    title: `${boutiqueConfig.name} - Boutique en ligne`,
    description: boutiqueConfig.description,
  };
}

export default async function BoutiqueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ boutique: string }>;
}) {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
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