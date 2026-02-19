import { Plus, Menu } from 'lucide-react';

interface ProductsHeaderProps {
  boutiqueName: string;
  totalProducts: number;
  onAddProduct: () => void;
  onToggleMobileMenu: () => void;
}

export function ProductsHeader({
  boutiqueName,
  totalProducts,
  onAddProduct,
  onToggleMobileMenu
}: ProductsHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
              Produits
            </h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
              Gérez les produits de votre boutique {boutiqueName}
              {totalProducts > 0 && ` • ${totalProducts} produit${totalProducts > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={onAddProduct}
          className="ml-4 flex items-center gap-2 bg-black text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>
    </div>
  );
}
