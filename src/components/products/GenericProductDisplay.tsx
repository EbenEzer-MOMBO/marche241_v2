'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ProduitDetail } from '@/lib/database-types';
import { Package } from 'lucide-react';

interface GenericVariant {
  id: string;
  image?: string;
  attributes: Array<{
    type: string;
    value: string;
  }>;
  stock: number;
  prix: number;
  prix_promo?: number;
}

interface GenericProductDisplayProps {
  product: ProduitDetail;
  onVariantChange: (variantId: string) => void;
  onAddToCart: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isAddingToCart: boolean;
  selectedVariantId?: string;
}

export function GenericProductDisplay({
  product,
  onVariantChange,
  onAddToCart,
  quantity,
  onQuantityChange,
  isAddingToCart,
  selectedVariantId
}: GenericProductDisplayProps) {
  const [selectedVariant, setSelectedVariant] = useState<GenericVariant | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [maxQuantity, setMaxQuantity] = useState(1);

  // Extraire les variants du produit
  const variants: GenericVariant[] = product.variants?.variants || [];

  // Extraire tous les types d'attributs disponibles
  const attributeTypes = new Set<string>();
  variants.forEach(v => {
    v.attributes?.forEach(attr => {
      attributeTypes.add(attr.type);
    });
  });

  const attributeTypesArray = Array.from(attributeTypes);

  // Initialiser le premier variant
  useEffect(() => {
    if (variants.length > 0) {
      const firstVariant = variants[0];
      setSelectedVariant(firstVariant);
      setMaxQuantity(firstVariant.stock);
      
      // Initialiser les attributs sélectionnés
      const initialAttrs: Record<string, string> = {};
      firstVariant.attributes?.forEach(attr => {
        initialAttrs[attr.type] = attr.value;
      });
      setSelectedAttributes(initialAttrs);
      
      onVariantChange(firstVariant.id);
    }
  }, []);

  // Mettre à jour la quantité max quand le variant change
  useEffect(() => {
    if (selectedVariant) {
      setMaxQuantity(selectedVariant.stock);
      if (quantity > selectedVariant.stock) {
        onQuantityChange(Math.min(quantity, selectedVariant.stock));
      }
    }
  }, [selectedVariant]);

  // Trouver le variant correspondant aux attributs sélectionnés
  const findMatchingVariant = (attrs: Record<string, string>): GenericVariant | null => {
    return variants.find(v => {
      return v.attributes?.every(attr => attrs[attr.type] === attr.value);
    }) || null;
  };

  const handleAttributeChange = (type: string, value: string) => {
    const newAttrs = { ...selectedAttributes, [type]: value };
    setSelectedAttributes(newAttrs);
    
    const matchingVariant = findMatchingVariant(newAttrs);
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      setMaxQuantity(matchingVariant.stock);
      onVariantChange(matchingVariant.id);
    }
  };

  // Obtenir les valeurs possibles pour un type d'attribut
  const getAttributeValues = (type: string): string[] => {
    const values = new Set<string>();
    variants.forEach(v => {
      const attr = v.attributes?.find(a => a.type === type);
      if (attr) {
        values.add(attr.value);
      }
    });
    return Array.from(values);
  };

  // Calculer le prix actuel
  const getCurrentPrice = () => {
    if (!selectedVariant) return 0;
    return selectedVariant.prix_promo || selectedVariant.prix;
  };

  const getOriginalPrice = () => {
    if (!selectedVariant || !selectedVariant.prix_promo) return null;
    return selectedVariant.prix;
  };

  // Obtenir le label français pour le type d'attribut
  const getAttributeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'couleur': 'Couleur',
      'taille': 'Taille',
      'contenance': 'Contenance',
      'capacite': 'Capacité',
      'modele': 'Modèle',
      'version': 'Version'
    };
    return labels[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Sélection des attributs */}
      {attributeTypesArray.map((type) => {
        const values = getAttributeValues(type);
        const label = getAttributeLabel(type);

        return (
          <div key={type}>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {label}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                // Vérifier si cette combinaison existe
                const testAttrs = { ...selectedAttributes, [type]: value };
                const matchingVariant = findMatchingVariant(testAttrs);
                const isAvailable = matchingVariant && matchingVariant.stock > 0;
                const isSelected = selectedAttributes[type] === value;

                return (
                  <button
                    key={value}
                    onClick={() => isAvailable && handleAttributeChange(type, value)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      !isAvailable
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {value}
                    {isAvailable && matchingVariant && (
                      <span className="ml-1 text-xs opacity-70">
                        ({matchingVariant.stock})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Stock disponible */}
      {selectedVariant && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            Stock disponible : <span className="font-medium text-gray-900">{maxQuantity} unité(s)</span>
          </p>
        </div>
      )}

      {/* Prix */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(getCurrentPrice())}
          </span>
          {getOriginalPrice() && (
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(getOriginalPrice()!)}
            </span>
          )}
        </div>
        {getOriginalPrice() && (
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-800 text-sm font-medium">
              -{Math.round((1 - getCurrentPrice() / getOriginalPrice()!) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Quantité */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Quantité
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onQuantityChange(Math.min(Math.max(1, val), maxQuantity));
            }}
            className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
          />
          <button
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Bouton d'ajout au panier - Masqué sur mobile (utilise le bouton flottant) */}
      <button
        onClick={onAddToCart}
        disabled={isAddingToCart || !selectedVariant || maxQuantity === 0}
        className="hidden lg:block w-full py-4 px-6 bg-gray-900 text-white rounded-lg font-medium text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
      </button>

      {/* Personnalisations (si disponibles) */}
      {product.variants?.personnalisations && product.variants.personnalisations.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Personnalisations disponibles
          </h3>
          <div className="space-y-2">
            {product.variants.personnalisations.map((custom: any) => (
              <div key={custom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{custom.libelle}</p>
                  {custom.obligatoire && (
                    <span className="text-xs text-red-600">Obligatoire</span>
                  )}
                </div>
                {custom.prix_supplementaire > 0 && (
                  <span className="text-sm font-medium text-gray-900">
                    +{formatPrice(custom.prix_supplementaire)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
