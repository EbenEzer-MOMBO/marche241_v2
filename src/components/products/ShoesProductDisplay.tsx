'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ProduitDetail } from '@/lib/database-types';
import { ShoppingBag } from 'lucide-react';

interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{
    pointure: string;
    stock: number;
  }>;
  prix: number;
  prix_promo?: number;
}

interface ShoesProductDisplayProps {
  product: ProduitDetail;
  onVariantChange: (variantId: string, pointure: string) => void;
  onAddToCart: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isAddingToCart: boolean;
  selectedVariantId?: string;
  selectedPointure?: string;
}

export function ShoesProductDisplay({
  product,
  onVariantChange,
  onAddToCart,
  quantity,
  onQuantityChange,
  isAddingToCart,
  selectedVariantId,
  selectedPointure
}: ShoesProductDisplayProps) {
  const [selectedVariant, setSelectedVariant] = useState<ShoesVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState(1);

  // Extraire les variants du produit
  const variants: ShoesVariant[] = product.variants?.variants || [];

  // Initialiser le variant et la pointure sélectionnés
  useEffect(() => {
    if (variants.length > 0) {
      const firstVariant = variants[0];
      setSelectedVariant(firstVariant);
      
      if (firstVariant.pointures.length > 0) {
        const firstSize = firstVariant.pointures[0].pointure;
        setSelectedSize(firstSize);
        setMaxQuantity(firstVariant.pointures[0].stock);
        onVariantChange(firstVariant.id, firstSize);
      }
    }
  }, []);

  // Mettre à jour la quantité max quand la sélection change
  useEffect(() => {
    if (selectedVariant && selectedSize) {
      const pointureObj = selectedVariant.pointures.find(p => p.pointure === selectedSize);
      if (pointureObj) {
        setMaxQuantity(pointureObj.stock);
        if (quantity > pointureObj.stock) {
          onQuantityChange(Math.min(quantity, pointureObj.stock));
        }
      }
    }
  }, [selectedVariant, selectedSize]);

  const handleVariantChange = (variant: ShoesVariant) => {
    setSelectedVariant(variant);
    
    // Sélectionner la première pointure disponible
    if (variant.pointures.length > 0) {
      const firstSize = variant.pointures[0].pointure;
      setSelectedSize(firstSize);
      setMaxQuantity(variant.pointures[0].stock);
      onVariantChange(variant.id, firstSize);
    }
  };

  const handleSizeChange = (pointure: string) => {
    setSelectedSize(pointure);
    
    if (selectedVariant) {
      const pointureObj = selectedVariant.pointures.find(p => p.pointure === pointure);
      if (pointureObj) {
        setMaxQuantity(pointureObj.stock);
        onVariantChange(selectedVariant.id, pointure);
      }
    }
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

  // Obtenir les couleurs uniques
  const couleurs = Array.from(new Set(variants.map(v => v.couleur)));

  return (
    <div className="space-y-6">
      
      {/* Sélection de la couleur */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Couleur
        </label>
        <div className="flex flex-wrap gap-2">
          {couleurs.map((couleur) => {
            const variant = variants.find(v => v.couleur === couleur);
            if (!variant) return null;

            const isSelected = selectedVariant?.couleur === couleur;
            const hasImage = !!variant.image;

            return (
              <button
                key={couleur}
                onClick={() => handleVariantChange(variant)}
                className={`relative px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                }`}
              >
                {couleur}
                {hasImage && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white" 
                        title="Image disponible" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection de la pointure */}
      {selectedVariant && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Pointure (EU)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {selectedVariant.pointures.map((pointureObj) => {
              const isSelected = selectedSize === pointureObj.pointure;
              const isOutOfStock = pointureObj.stock === 0;

              return (
                <button
                  key={pointureObj.pointure}
                  onClick={() => !isOutOfStock && handleSizeChange(pointureObj.pointure)}
                  disabled={isOutOfStock}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition-all text-center ${
                    isOutOfStock
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      : isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                  }`}
                >
                  {pointureObj.pointure}
                  {!isOutOfStock && (
                    <div className="text-xs opacity-70 mt-0.5">
                      {pointureObj.stock}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedSize && (
            <p className="mt-3 text-sm text-gray-600">
              Stock disponible : <span className="font-medium text-gray-900">{maxQuantity} paire(s)</span>
            </p>
          )}
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
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
          />
          <button
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Bouton d'ajout au panier - Masqué sur mobile (utilise le bouton flottant) */}
      <button
        onClick={onAddToCart}
        disabled={isAddingToCart || !selectedVariant || !selectedSize || maxQuantity === 0}
        className="hidden lg:block w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

      {/* Guide des tailles */}
      <div className="border-t border-gray-200 pt-6">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
            <span>📏 Guide des tailles</span>
            <span className="transform group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p>• Mesurez votre pied en fin de journée</p>
            <p>• Utilisez une règle ou un mètre</p>
            <p>• Référez-vous au tableau de correspondance</p>
            <p>• En cas de doute, prenez la taille au-dessus</p>
          </div>
        </details>
      </div>
    </div>
  );
}
