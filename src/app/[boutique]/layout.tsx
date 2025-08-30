import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Configuration des boutiques
const boutiques = {
  marche_241: {
    name: "Marché241",
    description: "Découvrez Marché241, votre boutique en ligne minimaliste pour une expérience d'achat simple et moderne",
    theme: {
      primary: "#004030",
      secondary: "#4A9782",
      accent: "#DCD0A8"
    }
  },
  boutique_de_joline: {
    name: "Boutique de Joline",
    description: "La boutique de Joline - Mode et accessoires tendance pour tous les goûts",
    theme: {
      primary: "#ec4899",
      secondary: "#db2777",
      accent: "#f472b6",
      black: "#000000",
    }
  }
};

type BoutiqueConfig = {
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

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

// Export de la configuration pour utilisation dans d'autres composants
export { boutiques };
export type { BoutiqueConfig };