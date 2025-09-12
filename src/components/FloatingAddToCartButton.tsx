'use client';

import { formatPrice } from '@/lib/utils';

interface FloatingAddToCartButtonProps {
  productName: string;
  price: number;
  quantity: number;
  onAddToCart: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function FloatingAddToCartButton({ 
  productName, 
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
        className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-4 hover:bg-primary/90 transition-colors duration-200 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Ajout en cours...</span>
          </>
        ) : (
          <>
            <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {quantity}
            </span>
            <span>{disabled ? 'Indisponible' : 'Ajouter'}</span>
            <span>{formatPrice(totalPrice)}</span>
          </>
        )}
      </button>
    </div>
  );
}
