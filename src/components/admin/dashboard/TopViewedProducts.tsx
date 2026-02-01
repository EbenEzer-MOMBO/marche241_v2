import { TrendingUp, Eye } from 'lucide-react';

interface ProduitPopulaire {
  id: number;
  nom: string;
  nombre_vues: number;
  image_principale?: string;
}

interface TopViewedProductsProps {
  products: ProduitPopulaire[];
  boutiqueSlug: string;
  onNavigate: (path: string) => void;
}

export const TopViewedProducts: React.FC<TopViewedProductsProps> = ({ 
  products, 
  boutiqueSlug, 
  onNavigate 
}) => {
  // Trouver le maximum de vues pour normaliser les barres
  const maxVues = products.length > 0 
    ? Math.max(...products.map(p => p.nombre_vues)) 
    : 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Produits les plus vus
          </h2>
        </div>
        <button
          onClick={() => onNavigate(`/admin/${boutiqueSlug}/products`)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Voir tout
        </button>
      </div>
      
      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((produit, index) => {
            const pourcentage = (produit.nombre_vues / maxVues) * 100;
            
            return (
              <div
                key={produit.id}
                className="group cursor-pointer"
                onClick={() => onNavigate(`/${boutiqueSlug}/produit/${produit.id}`)}
                title={`Voir le produit ${produit.nom}`}
              >
                {/* En-tête du produit */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0 mr-3">
                    {/* Badge de rang */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                      index === 0 
                        ? 'bg-yellow-100 text-yellow-700'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Nom du produit */}
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                      {produit.nom}
                    </p>
                  </div>
                  
                  {/* Nombre de vues */}
                  <div className="flex items-center flex-shrink-0 text-sm text-gray-600">
                    <Eye className="h-4 w-4 mr-1 text-indigo-500" />
                    <span className="font-semibold">{produit.nombre_vues.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        : index === 1
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : index === 2
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                    style={{ width: `${pourcentage}%` }}
                  >
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Les statistiques de vues apparaîtront ici une fois que vos produits commenceront à être consultés
          </p>
        </div>
      )}
      
      {/* Légende */}
      {products.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-indigo-400 rounded-full mt-2"></div>
            </div>
            <p className="ml-3 text-xs text-gray-600">
              Classement basé sur le nombre de vues uniques par produit. Les barres représentent la popularité relative.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
