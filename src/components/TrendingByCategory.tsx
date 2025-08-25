import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface CategorySection {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

export default function TrendingByCategory() {
  const categorySections: CategorySection[] = [
    {
      id: 'fashion',
      name: 'Mode',
      icon: '👕',
      products: [
        {
          id: '2',
          name: 'Robe Élégante',
          price: 45000,
          image: '/article2.webp',
          isNew: true
        },
        {
          id: '4',
          name: 'Sneakers Comfort',
          price: 75000,
          originalPrice: 85000,
          image: '/article4.webp',
          isSale: true
        },
        {
          id: '5',
          name: 'Accessoire Tendance',
          price: 35000,
          image: '/article5.webp',
          isNew: true
        },
        {
          id: '6',
          name: 'T-shirt Premium',
          price: 28000,
          image: '/article1.webp'
        }
      ]
    },
    {
      id: 'electronics',
      name: 'Électronique',
      icon: '📱',
      products: [
        {
          id: '1',
          name: 'Smartphone Elite Pro',
          price: 299999,
          originalPrice: 349999,
          image: '/article1.webp',
          isSale: true
        },
        {
          id: '7',
          name: 'Écouteurs Wireless',
          price: 85000,
          image: '/article2.webp',
          isNew: true
        },
        {
          id: '8',
          name: 'Tablette Ultra',
          price: 180000,
          originalPrice: 200000,
          image: '/article3.webp',
          isSale: true
        },
        {
          id: '9',
          name: 'Montre Connectée',
          price: 120000,
          image: '/article4.webp'
        }
      ]
    },
    {
      id: 'home',
      name: 'Maison',
      icon: '🏠',
      products: [
        {
          id: '3',
          name: 'Lampe Design',
          price: 25000,
          image: '/article3.webp'
        },
        {
          id: '10',
          name: 'Coussin Décoratif',
          price: 15000,
          image: '/article5.webp',
          isNew: true
        },
        {
          id: '11',
          name: 'Vase Moderne',
          price: 35000,
          originalPrice: 45000,
          image: '/article1.webp',
          isSale: true
        },
        {
          id: '12',
          name: 'Miroir Design',
          price: 55000,
          image: '/article2.webp'
        }
      ]
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Produits Tendance
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Découvrez les produits les plus populaires dans chaque catégorie, 
            sélectionnés spécialement pour vous.
          </p>
        </div>

        {/* Sections par catégorie */}
        <div className="space-y-16">
          {categorySections.map((category) => (
            <div key={category.id} className="shadow-md border border-gray-100 rounded-2xl p-6 lg:p-8">
              {/* En-tête de la catégorie */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-primary">{category.name}</h3>
                </div>
              </div>

              {/* Grille des produits */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {category.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produits/${product.id}`}
                    className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    {/* Image du produit */}
                    <div className="relative mb-3">
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div>
                      {/* Nom du produit */}
                      <h4 className="text-foreground font-medium text-sm mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-200">
                        {product.name}
                      </h4>
                      
                      {/* Prix */}
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-semibold text-sm">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-gray-medium line-through text-xs">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bouton "Afficher tout" */}
              <div className="text-center">
                <Link
                  href={`/categories/${category.id}`}
                  className="inline-flex items-center border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:text-white transition-colors duration-200"
                >
                  Afficher tout
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
          ))}
        </div>
      </div>
    </section>
  );
}
