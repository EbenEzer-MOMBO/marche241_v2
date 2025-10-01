import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { getBoutiqueConfig, type BoutiqueConfig } from '@/lib/boutiques';
import { getBoutiqueBySlug } from '@/lib/services/boutiques';
import { getProduitById, formatApiProduitPourDetail, formatProduitPourAffichage } from '@/lib/services/produits';
import type { ProduitDetail, ProduitAffichage } from '@/lib/database-types';

interface ProductPageProps {
  params: Promise<{
    boutique: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { boutique, id } = await params;
  
  let boutiqueConfig: BoutiqueConfig;
  let boutiqueData;
  let productData: ProduitDetail | null = null;
  let productDisplay: ProduitAffichage | null = null;
  
  try {
    // Récupérer les données de la boutique
    const [configResult, boutiqueResult] = await Promise.all([
      getBoutiqueConfig(boutique),
      getBoutiqueBySlug(boutique)
    ]);

    boutiqueConfig = configResult;
    boutiqueData = boutiqueResult;

    if (!boutiqueData) {
      console.error('Boutique non trouvée:', boutique);
      notFound();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    notFound();
  }

  try {
    // Récupérer les données du produit
    const produitDB = await getProduitById(Number(id));
    
    if (!produitDB) {
      console.error('Produit non trouvé:', id);
      notFound();
    }

    // Formater le produit pour l'affichage détaillé
    const formattedProduct = formatApiProduitPourDetail({
      success: true,
      produit: produitDB
    });

    if (!formattedProduct) {
      console.error('Erreur lors du formatage du produit:', id);
      notFound();
    }

    productData = formattedProduct;
    productDisplay = formatProduitPourAffichage(produitDB);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    notFound();
  }

  // Vérification finale des données requises
  if (!productData || !productDisplay || !boutiqueData) {
    console.error('Données manquantes pour l\'affichage du produit');
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
      <ProductDetail 
        productId={id}
        productData={productData}
        productDisplay={productDisplay}
        boutiqueSlug={boutique}
        boutiqueData={boutiqueData}
      />
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
    // Récupérer les données de la boutique et du produit en parallèle
    const [boutiqueConfig, produitDB] = await Promise.all([
      getBoutiqueConfig(boutique),
      getProduitById(Number(id))
    ]);

    if (!produitDB) {
      throw new Error('Produit non trouvé');
    }

    // Formater le produit pour l'affichage détaillé
    const productDetail = formatApiProduitPourDetail({
      success: true,
      produit: produitDB
    });

    if (!productDetail) {
      throw new Error('Erreur lors du formatage du produit');
    }

    return {
      title: `${productDetail.nom} - ${boutiqueConfig.name}`,
      description: productDetail.description || productDetail.description_courte || `Découvrez ${productDetail.nom} sur ${boutiqueConfig.name}`,
      openGraph: {
        title: `${productDetail.nom} - ${boutiqueConfig.name}`,
        description: productDetail.description || productDetail.description_courte || `Découvrez ${productDetail.nom} sur ${boutiqueConfig.name}`,
        images: productDetail.image_principale ? [productDetail.image_principale] : undefined,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: 'Produit non trouvé',
      description: 'Ce produit n\'existe pas'
    };
  }
}