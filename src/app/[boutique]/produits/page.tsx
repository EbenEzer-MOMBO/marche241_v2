import MainLayout from '@/components/MainLayout';
import { boutiques, type BoutiqueConfig } from '@/lib/boutiques';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ProduitsPageProps {
  params: Promise<{
    boutique: string;
  }>;
}

// Données de test pour les produits
const getProductsForBoutique = (boutiqueName: string) => {
  const baseProducts = [
    {
      id: '1',
      name: 'T-shirt Premium',
      price: 25000,
      image: '/article1.webp',
      category: 'Mode'
    },
    {
      id: '2',
      name: 'Robe Élégante',
      price: 45000,
      image: '/article2.webp',
      category: 'Mode'
    },
    {
      id: '3',
      name: 'Accessoire Tendance',
      price: 35000,
      image: '/article3.webp',
      category: 'Accessoires'
    },
    {
      id: '4',
      name: 'Sneakers Comfort',
      price: 75000,
      image: '/article4.webp',
      category: 'Chaussures'
    },
    {
      id: '5',
      name: 'Sac à Main',
      price: 55000,
      image: '/article5.webp',
      category: 'Accessoires'
    }
  ];

  // Personnaliser les produits selon la boutique
  if (boutiqueName === 'boutique_de_joline') {
    return baseProducts.map(product => ({
      ...product,
      name: product.name + ' - Collection Joline'
    }));
  }

  return baseProducts;
};

export default async function ProduitsPage({ params }: ProduitsPageProps) {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    notFound();
  }

  const products = getProductsForBoutique(boutique);

  return (
    <MainLayout boutiqueConfig={boutiqueConfig} boutiqueName={boutique}>
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Nos Produits - {boutiqueConfig.name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection de produits de qualité
            </p>
          </div>

          {/* Grille de produits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-square relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {product.price.toLocaleString()} FCFA
                    </span>
                    <button className="bg-foreground text-white px-4 py-2 rounded-lg text-sm hover:bg-foreground/90 transition-colors">
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lien de retour */}
          <div className="text-center mt-12">
            <Link
              href={`/${boutique}`}
              className="inline-flex items-center text-foreground hover:text-foreground/80 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Génération statique des routes
export async function generateStaticParams() {
  return Object.keys(boutiques).map((boutique) => ({
    boutique,
  }));
}