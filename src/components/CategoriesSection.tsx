import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

export default function CategoriesSection() {
  const categories: Category[] = [
    {
      id: 'electronics',
      name: 'Électronique',
      description: 'Smartphones, ordinateurs, accessoires',
      icon: '📱',
      itemCount: 125
    },
    {
      id: 'fashion',
      name: 'Mode',
      description: 'Vêtements, chaussures, accessoires',
      icon: '👕',
      itemCount: 89
    },
    {
      id: 'home',
      name: 'Maison',
      description: 'Décoration, meubles, cuisine',
      icon: '🏠',
      itemCount: 67
    },
    {
      id: 'beauty',
      name: 'Beauté',
      description: 'Cosmétiques, soins, parfums',
      icon: '💄',
      itemCount: 54
    },
    {
      id: 'sports',
      name: 'Sport',
      description: 'Équipements, vêtements de sport',
      icon: '⚽',
      itemCount: 43
    },
    {
      id: 'books',
      name: 'Livres',
      description: 'Romans, éducatif, BD',
      icon: '📚',
      itemCount: 156
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Nos Catégories
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Explorez notre large gamme de produits organisés par catégories 
            pour faciliter votre recherche et votre expérience d'achat.
          </p>
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group bg-background hover:bg-accent/30 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-accent/20"
            >
              <div className="text-center">
                {/* Icône */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                
                {/* Nom de la catégorie */}
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {category.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-dark mb-3 text-sm">
                  {category.description}
                </p>
                
                {/* Nombre d'articles */}
                <div className="flex justify-center items-center">
                  <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                    {category.itemCount} articles
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bouton voir toutes les catégories */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center text-secondary hover:text-primary font-medium transition-colors duration-200"
          >
            Voir toutes les catégories
            <svg
              className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
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
