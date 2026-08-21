'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ProduitDetail } from '@/lib/database-types';
import { ShoppingBag } from 'lucide-react';
import type { PersonnalisationEtatFormulaire, PersonnalisationProduitDef } from '@/lib/types/personnalisations';
import { ProductPersonnalisationsFields } from './ProductPersonnalisationsFields';
import { getColorSwatch } from '@/lib/utils/color-swatch';

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
  onBuyNow?: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  isAddingToCart: boolean;
  selectedVariantId?: string;
  selectedPointure?: string;
  personnalisationsEtat: Record<string, PersonnalisationEtatFormulaire>;
  onPersonnalisationToggle: (id: string, nextActive: boolean) => void;
  onPersonnalisationValueChange: (id: string, value: string) => void;
  personnalisationValidationErrors?: Record<string, string>;
}

export function ShoesProductDisplay({
  product,
  onVariantChange,
  onAddToCart,
  onBuyNow,
  quantity,
  onQuantityChange,
  isAddingToCart,
  selectedVariantId,
  selectedPointure,
  personnalisationsEtat,
  onPersonnalisationToggle,
  onPersonnalisationValueChange,
  personnalisationValidationErrors,
}: ShoesProductDisplayProps) {
  const [selectedVariant, setSelectedVariant] = useState<ShoesVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState(1);

  // Extraire les variants du produit
  const variants: ShoesVariant[] = product.variants?.variants || [];
  const personnalisationDefs = (
    (product.variants as { personnalisations?: PersonnalisationProduitDef[] })?.personnalisations ??
    []
  ) as PersonnalisationProduitDef[];

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
        <div className="font-medium text-[13px] text-[#3c4045]">
            Couleur : <span className="font-semibold text-[#17181a]">{selectedVariant?.couleur}</span>
          </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {couleurs.map((couleur) => {
            const variant = variants.find(v => v.couleur === couleur);
            if (!variant) return null;

            const isSelected = selectedVariant?.couleur === couleur;

            return (
              <button
                key={couleur}
                type="button"
                onClick={() => handleVariantChange(variant)}
                aria-pressed={isSelected}
                aria-label={`Couleur ${couleur}`}
                className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] py-1.5 pl-1.5 pr-3 text-[12.5px] font-medium transition-colors ${
                  isSelected
                    ? 'border-[var(--color-shop-primary,var(--primary-color))] bg-[color-mix(in_srgb,var(--color-shop-primary,var(--primary-color))_10%,white)] text-[var(--color-shop-primary,var(--primary-color))]'
                    : 'border-[#e0ded9] bg-white text-[#3c4045] hover:border-[#cfcbc3]'
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-[rgba(23,24,26,.16)]"
                  style={{ background: getColorSwatch(couleur) }}
                  aria-hidden
                />
                {couleur}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection de la pointure */}
      {selectedVariant && (
        <div>
          <div className="font-medium text-[13px] text-[#3c4045]">
            Pointure : <span className="font-semibold text-[#17181a]">{selectedSize}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedVariant.pointures.map((pointureObj) => {
              const isSelected = selectedSize === pointureObj.pointure;
              const isOutOfStock = pointureObj.stock === 0;

              return (
                <button
                  key={pointureObj.pointure}
                  type="button"
                  onClick={() => !isOutOfStock && handleSizeChange(pointureObj.pointure)}
                  disabled={isOutOfStock}
                  aria-pressed={isSelected}
                  aria-label={`Pointure ${pointureObj.pointure}`}
                  className={`inline-flex min-w-12 items-center justify-center rounded-[9px] border-[1.5px] px-3 text-[13.5px] font-semibold h-11 lg:h-[38px] ${
                    isOutOfStock
                      ? 'cursor-not-allowed border-[#f0efec] bg-[#fafaf8] text-[#c0beb8] line-through'
                      : isSelected
                      ? 'border-[var(--color-shop-primary,var(--primary-color))] bg-[color-mix(in_srgb,var(--color-shop-primary,var(--primary-color))_10%,white)] text-[var(--color-shop-primary,var(--primary-color))]'
                      : 'border-[#e0ded9] bg-white text-[#17181a] hover:border-[#cfcbc3]'
                  }`}
                >
                  {pointureObj.pointure}
                </button>
              );
            })}
          </div>
          {selectedSize && maxQuantity > 0 && maxQuantity <= 3 && (
            <p className="mt-2 font-mono text-[12.5px] font-medium text-[#d97706]">
              {selectedVariant.couleur} · {selectedSize} : plus que {maxQuantity} en stock
            </p>
          )}
        </div>
      )}

      {/* Prix — desktop uniquement (mobile : barre collante) */}
      <div className="hidden border-t border-[#f0efec] pt-6 lg:block">
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

      {/* Quantité — desktop uniquement (mobile : barre collante) */}
      <div className="hidden lg:block">
        <label className="mb-3 block text-sm font-medium text-[#17181a]">
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

      <ProductPersonnalisationsFields
        definitions={personnalisationDefs}
        state={personnalisationsEtat}
        onToggle={onPersonnalisationToggle}
        onValueChange={onPersonnalisationValueChange}
        validationErrors={personnalisationValidationErrors}
      />

      {/* Boutons d'action - Masqués sur mobile (barre collante) */}
      <div className="hidden space-y-2.5 lg:block">
        <button
          type="button"
          onClick={onBuyNow || onAddToCart}
          disabled={isAddingToCart || !selectedVariant || !selectedSize || maxQuantity === 0}
          className="flex h-[50px] w-full items-center justify-center rounded-[10px] text-[15px] font-semibold disabled:cursor-not-allowed disabled:bg-[#c0beb8] disabled:text-white"
          style={{
            backgroundColor: 'var(--color-shop-primary, var(--primary-color))',
            color: 'var(--shop-cta-fg, #fff)',
          }}
        >
          {isAddingToCart ? 'Ajout en cours…' : 'Acheter maintenant'}
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAddingToCart || !selectedVariant || !selectedSize || maxQuantity === 0}
          className="flex h-12 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[#17181a] text-[15px] font-semibold text-[#17181a] disabled:opacity-50"
        >
          Ajouter au panier
        </button>
        <p className="text-center text-[12.5px] text-[#8b8f95]">
          « Acheter maintenant » vous mène directement au récap commande.
        </p>
      </div>

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
