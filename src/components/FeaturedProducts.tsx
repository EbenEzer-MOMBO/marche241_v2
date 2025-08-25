import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}

export default function FeaturedProducts() {
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Smartphone Elite Pro',
      price: 299999,
      originalPrice: 349999,
      image: '/article1.webp',
      category: 'Électronique',
      isSale: true
    },
    {
      id: '2',
      name: 'Robe Élégante',
      price: 45000,
      image: '/article2.webp',
      category: 'Mode',
      isNew: true
    },
    {
      id: '3',
      name: 'Lampe Design',
      price: 25000,
      image: '/article3.webp',
      category: 'Maison'
    },
    {
      id: '4',
      name: 'Sneakers Comfort',
      price: 75000,
      originalPrice: 85000,
      image: '/article4.webp',
      category: 'Mode',
      isSale: true
    },
    {
      id: '5',
      name: 'Accessoire Tendance',
      price: 35000,
      image: '/article5.webp',
      category: 'Mode',
      isNew: true
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <section className="py-16 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Produits Mis en Avant
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Découvrez notre sélection de produits tendance, 
            choisis spécialement pour vous offrir le meilleur de notre catalogue.
          </p>
        </div>

        {/* Grille des produits - 2 colonnes */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto sm:max-w-lg lg:max-w-2xl">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/produits/${product.id}`}
              className="group flex flex-col items-center text-center"
            >
              {/* Image ronde du produit */}
              <div className="relative mb-3">
                <div className="w-40 h-40 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-medium">
                      Nouveau
                    </span>
                  )}
                  {product.isSale && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Promo
                    </span>
                  )}
                </div>
              </div>

              {/* Informations du produit */}
              <div className="w-full">
                {/* Catégorie */}
                <p className="text-secondary text-xs sm:text-sm font-medium mb-1">
                  {product.category}
                </p>
                
                {/* Nom du produit */}
                <h3 className="text-foreground font-semibold text-sm sm:text-base mb-2 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Prix */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-foreground text-sm sm:text-base">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-medium line-through text-xs sm:text-sm">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bouton voir tous les produits */}
        <div className="text-center mt-12">
          <Link
            href="/produits"
            className="inline-flex items-center bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors duration-200"
          >
            Voir tous nos produits
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
