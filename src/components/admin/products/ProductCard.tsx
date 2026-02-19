import Image from 'next/image';
import { Edit, Trash2, Eye, EyeOff, Star, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  product: {
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
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_principale ? (
          <Image
            src={product.image_principale}
            alt={product.nom}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📦</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.est_nouveau && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Nouveau
            </span>
          )}
          {product.est_en_promotion && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Promo
            </span>
          )}
          {product.est_featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Star className="h-3 w-3" fill="currentColor" />
              Vedette
            </span>
          )}
        </div>

        {/* Statut */}
        <div className="absolute top-2 right-2">
          <button
            onClick={onToggleStatus}
            className={`p-1.5 rounded-full transition-colors ${
              product.actif
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title={product.actif ? 'Produit actif' : 'Produit inactif'}
          >
            {product.actif ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Nom et catégorie */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {product.nom}
          </h3>
          {product.categorie_nom && (
            <p className="text-xs text-gray-500 mt-1">{product.categorie_nom}</p>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Prix */}
        <div className="mb-3">
          {product.est_en_promotion && product.prix_original ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.prix)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.prix_original)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.prix)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="mb-3">
          {product.en_stock ? (
            <span className="text-sm text-green-600 font-medium">
              En stock ({product.quantite_stock})
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium">
              Rupture de stock
            </span>
          )}
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1" title="Note moyenne">
            <Star className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" />
            <span>{product.note_moyenne.toFixed(1)} ({product.nombre_avis})</span>
          </div>
          <div className="flex items-center gap-1" title="Nombre de ventes">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{product.nombre_ventes} ventes</span>
          </div>
          <div className="flex items-center gap-1" title="Nombre de vues">
            <Eye className="h-3.5 w-3.5" />
            <span>{product.nombre_vues}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
