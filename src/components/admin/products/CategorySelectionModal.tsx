'use client';

import { X } from 'lucide-react';
import { ProductCategory, getAllCategories } from '@/lib/constants/product-categories';

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: ProductCategory) => void;
}

export function CategorySelectionModal({
  isOpen,
  onClose,
  onSelectCategory
}: CategorySelectionModalProps) {
  if (!isOpen) return null;

  const categories = getAllCategories();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quel type de produit vendez-vous ?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sélectionnez la catégorie qui correspond le mieux à votre produit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Grille de catégories */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`${category.bgColor} ${category.color} p-6 rounded-lg border-2 border-transparent hover:border-current transition-all duration-200 text-left group hover:scale-105`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-current">
                  {category.nom}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            💡 Vous pourrez ajouter plus de détails sur la prochaine étape
          </p>
        </div>
      </div>
    </div>
  );
}
