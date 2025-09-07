import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { boutiques, type BoutiqueConfig } from '@/lib/boutiques';

interface ProductPageProps {
  params: Promise<{
    boutique: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { boutique, id } = await params;
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
      <ProductDetail productId={id} />
    </div>
  );
}

// Génération statique des routes pour les produits
export async function generateStaticParams() {
  const paths = [];
  
  // Pour chaque boutique
  for (const boutique of Object.keys(boutiques)) {
    // Générer quelques IDs de produits de test
    const productIds = ['1', '2', '3', '4', '5'];
    
    for (const id of productIds) {
      paths.push({
        boutique,
        id
      });
    }
  }
  
  return paths;
}

// Métadonnées dynamiques
export async function generateMetadata({
  params,
}: {
  params: Promise<{ boutique: string; id: string }>;
}) {
  const { boutique, id } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas'
    };
  }

  return {
    title: `Produit ${id} - ${boutiqueConfig.name}`,
    description: `Découvrez ce produit sur ${boutiqueConfig.name}`,
  };
}