import Link from 'next/link';

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
      image: '📱',
      category: 'Électronique',
      isSale: true
    },
    {
      id: '2',
      name: 'Robe Élégante',
      price: 45000,
      image: '👗',
      category: 'Mode',
      isNew: true
    },
    {
      id: '3',
      name: 'Lampe Design',
      price: 25000,
      image: '💡',
      category: 'Maison'
    },
    {
      id: '4',
      name: 'Sneakers Comfort',
      price: 75000,
      originalPrice: 85000,
      image: '👟',
      category: 'Mode',
      isSale: true
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
          <h2 className="text-3xl font-bold text-primary mb-4">
            Produits Mis en Avant
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Découvrez notre sélection de produits tendance, 
            choisis spécialement pour vous offrir le meilleur de notre catalogue.
          </p>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/produits/${product.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-accent/20"
            >
              {/* Image du produit */}
              <div className="aspect-square bg-accent/10 flex items-center justify-center relative overflow-hidden">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
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
              <div className="p-4">
                {/* Catégorie */}
                <p className="text-secondary text-sm font-medium mb-1">
                  {product.category}
                </p>
                
                {/* Nom du produit */}
                <h3 className="text-primary font-semibold mb-2 group-hover:text-secondary transition-colors duration-200">
                  {product.name}
                </h3>
                
                {/* Prix */}
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-gray-medium line-through text-sm">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bouton d'action au hover */}
              <div className="p-4 pt-0">
                <button className="w-full bg-primary text-white py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/90">
                  Voir le produit
                </button>
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
