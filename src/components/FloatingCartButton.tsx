'use client';

import { usePathname } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  variant?: string;
}

interface FloatingCartButtonProps {
  onCartClick: () => void;
  cartItems?: CartItem[];
}

export default function FloatingCartButton({ onCartClick, cartItems = [] }: FloatingCartButtonProps) {
  const pathname = usePathname();
  
  // Ne pas afficher sur les pages produit
  const isProductPage = pathname?.startsWith('/produits/');
  
  // Données de test pour le panier (remplacer par les vraies données)
  const defaultCartItems: CartItem[] = [
    {
      id: '1',
      name: 'Initial Armandèse',
      price: 12500,
      quantity: 1,
      image: '/article2.webp',
      category: 'Mode',
      variant: 'Initial : D'
    }
  ];

  const items = cartItems.length > 0 ? cartItems : defaultCartItems;

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Ne pas afficher le bouton s'il n'y a pas d'articles ou si on est sur une page produit
  if (items.length === 0 || isProductPage) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden">
      <button
        onClick={onCartClick}
        className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-4 hover:bg-primary/90 transition-colors duration-200 shadow-lg"
      >
        <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          {getTotalItems()}
        </span>
        <span>Panier</span>
        <span>{getTotalPrice().toLocaleString()} FCFA</span>
      </button>
    </div>
  );
}
