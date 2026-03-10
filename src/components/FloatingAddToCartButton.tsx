'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface FloatingAddToCartButtonProps {
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  onAddToCart: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function FloatingAddToCartButton({ 
  productName,
  productImage,
  price, 
  quantity, 
  onAddToCart,
  disabled = false,
  loading = false
}: FloatingAddToCartButtonProps) {
  const totalPrice = price * quantity;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden">
      <button
        onClick={onAddToCart}
        disabled={disabled || loading}
        className="w-full py-3 px-4 rounded-2xl font-medium flex items-center justify-between transition-all duration-200 shadow-lg border-2 text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled ? undefined : 'var(--primary-color)',
          borderColor: disabled ? undefined : 'var(--primary-color)'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--primary-color)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.color = 'white';
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center w-full space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Ajout en cours...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={productImage}
                  alt={productName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="text-sm font-medium truncate max-w-[100px] w-full text-left">
                  {productName}
                </span>
                <span className="text-xs opacity-90">
                  Quantité: {quantity}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-2">
              <span className="text-lg font-bold whitespace-nowrap">
                {formatPrice(totalPrice)}
              </span>
              <span className="text-xs opacity-90">
                {disabled ? 'Indisponible' : 'Ajouter'}
              </span>
            </div>
          </>
        )}
      </button>
    </div>
  );
}
