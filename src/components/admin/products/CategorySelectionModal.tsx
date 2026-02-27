'use client';

import { X, Shirt, ShoppingBag, Package } from 'lucide-react';
import { ProductCategory } from '@/lib/constants/product-categories';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: ProductCategory) => void;
}

const SIMPLIFIED_CATEGORIES = [
  {
    id: 'vetements' as ProductCategory,
    nom: 'Vêtements',
    description: 'T-shirts, robes, pantalons, etc.',
    icon: <Shirt className="h-12 w-12" />,
    bgColor: 'bg-purple-50',
    color: 'text-purple-700',
    borderColor: 'hover:border-purple-500'
  },
  {
    id: 'chaussures' as ProductCategory,
    nom: 'Chaussures',
    description: 'Baskets, sandales, bottes, etc.',
    icon: <ShoppingBag className="h-12 w-12" />,
    bgColor: 'bg-blue-50',
    color: 'text-blue-700',
    borderColor: 'hover:border-blue-500'
  },
  {
    id: 'autres' as ProductCategory,
    nom: 'Autres',
    description: 'Accessoires, beauté, livres, etc.',
    icon: <Package className="h-12 w-12" />,
    bgColor: 'bg-green-50',
    color: 'text-green-700',
    borderColor: 'hover:border-green-500'
  }
];

export function CategorySelectionModal({
  isOpen,
  onClose,
  onSelectCategory
}: CategorySelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quel type de produit vendez-vous ?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choisissez le type de formulaire adapté à votre produit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Grille de catégories simplifiée */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SIMPLIFIED_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`${category.bgColor} ${category.color} p-8 rounded-xl border-2 border-transparent ${category.borderColor} transition-all duration-200 text-center group hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {category.nom}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            💡 Chaque type de produit a un formulaire adapté pour faciliter l'ajout
          </p>
        </div>
      </div>
    </div>
  );
}
