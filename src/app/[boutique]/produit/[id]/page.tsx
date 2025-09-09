import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { getBoutiqueConfig, type BoutiqueConfig } from '@/lib/boutiques';

interface ProductPageProps {
  params: Promise<{
    boutique: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { boutique, id } = await params;
  
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
      <ProductDetail productId={id} />
    </div>
  );
}

// Génération statique des routes pour les produits
export async function generateStaticParams() {
  const paths = [];
  
  // Pour l'instant, on garde les slugs connus
  // TODO: Récupérer depuis l'API en production
  const boutiques = ['marche_241', 'boutique_de_joline'];
  
  // Pour chaque boutique
  for (const boutique of boutiques) {
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
  
  try {
    const boutiqueConfig = await getBoutiqueConfig(boutique);
    return {
      title: `Produit ${id} - ${boutiqueConfig.name}`,
      description: `Découvrez ce produit sur ${boutiqueConfig.name}`,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas'
    };
  }
}