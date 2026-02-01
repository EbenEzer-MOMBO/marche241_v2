import { Package, Plus } from 'lucide-react';

interface Produit {
  id: number;
  nom: string;
  prix: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  image_principale?: string;
}

interface RecentProductsProps {
  products: Produit[];
  boutiqueSlug: string;
  onNavigate: (path: string) => void;
}

export const RecentProducts: React.FC<RecentProductsProps> = ({ 
  products, 
  boutiqueSlug, 
  onNavigate 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Produits récents</h2>
        <button
          onClick={() => onNavigate(`/admin/${boutiqueSlug}/products`)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Voir tout
        </button>
      </div>
      
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((produit) => (
            <div
              key={produit.id}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {}}
            >
              <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-lg overflow-hidden">
                {produit.image_principale ? (
                  <img
                    src={produit.image_principale}
                    alt={produit.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{produit.nom}</p>
                <p className="text-sm text-gray-500">{produit.prix.toLocaleString()} FCFA</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  produit.statut === 'actif' 
                    ? 'bg-green-100 text-green-800' 
                    : produit.statut === 'inactif'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {produit.statut === 'actif' ? 'Actif' : produit.statut === 'inactif' ? 'Inactif' : 'Brouillon'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            Commencez par ajouter vos premiers produits à votre boutique
          </p>
          <button
            onClick={() => onNavigate(`/admin/${boutiqueSlug}/products/new`)}
            className="inline-flex items-center px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter mon premier produit
          </button>
        </div>
      )}
    </div>
  );
};
