import { Package } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  prix_original?: number;
  image_principale?: string;
  en_stock: boolean;
  quantite_stock: number;
  actif: boolean;
  est_nouveau: boolean;
  est_en_promotion: boolean;
  est_featured: boolean;
  note_moyenne: number;
  nombre_avis: number;
  nombre_ventes: number;
  nombre_vues: number;
  categorie_nom?: string;
}

interface ProductsGridProps {
  groupedProducts: Record<string, Product[]>;
  groupByCategory: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleStatus: (id: number) => void;
  getCategoryIcon: (categoryName: string) => string;
  getCategoryColor: (categoryName: string) => string;
}

export function ProductsGrid({
  groupedProducts,
  groupByCategory,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  getCategoryIcon,
  getCategoryColor
}: ProductsGridProps) {
  const isEmpty = Object.keys(groupedProducts).length === 0 || 
    Object.values(groupedProducts).every(products => products.length === 0);

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun produit
        </h3>
        <p className="text-gray-500">
          Commencez par ajouter votre premier produit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedProducts).map(([category, products]) => (
        <div key={category}>
          {/* En-tête de catégorie (si regroupement actif) */}
          {groupByCategory && (
            <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${
              getCategoryColor(category).split(' ')[1]
            }`}>
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              <h2 className="text-xl font-bold text-gray-900">{category}</h2>
              <span className="text-sm text-gray-500">
                ({products.length} produit{products.length > 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Grille de produits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => onEditProduct(product)}
                onDelete={() => onDeleteProduct(product)}
                onToggleStatus={() => onToggleStatus(product.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
