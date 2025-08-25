'use client';

interface FloatingAddToCartButtonProps {
  productName: string;
  price: number;
  quantity: number;
  onAddToCart: () => void;
  disabled?: boolean;
}

export default function FloatingAddToCartButton({ 
  productName, 
  price, 
  quantity, 
  onAddToCart,
  disabled = false
}: FloatingAddToCartButtonProps) {
  const totalPrice = price * quantity;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden">
      <button
        onClick={onAddToCart}
        disabled={disabled}
        className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-4 hover:bg-primary/90 transition-colors duration-200 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          {quantity}
        </span>
        <span>Ajouter</span>
        <span>{formatPrice(totalPrice)}</span>
      </button>
    </div>
  );
}
