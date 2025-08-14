'use client';

import Image from 'next/image';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // Données de test pour le panier
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Smartphone Elite Pro',
      price: 299999,
      quantity: 1,
      image: '📱',
      category: 'Électronique'
    },
    {
      id: '2',
      name: 'Robe Élégante',
      price: 45000,
      quantity: 2,
      image: '👗',
      category: 'Mode'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar du panier */}
      <aside className={`fixed right-0 top-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* En-tête du panier */}
          <div className="flex items-center justify-between p-4 border-b border-accent/20 bg-primary text-white">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🛒</span>
              <h2 className="text-lg font-semibold">Mon Panier</h2>
              <span className="bg-secondary text-white text-xs rounded-full px-2 py-1">
                {getTotalItems()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-accent transition-colors duration-200"
              aria-label="Fermer le panier"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Contenu du panier */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
            {cartItems.length === 0 ? (
              /* Panier vide */
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Votre panier est vide
                </h3>
                <p className="text-gray-dark mb-6">
                  Découvrez nos produits et ajoutez-les à votre panier
                </p>
                <Link
                  href="/produits"
                  onClick={onClose}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Découvrir nos produits
                </Link>
              </div>
            ) : (
              /* Articles du panier */
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 bg-background/50 rounded-lg p-3">
                    {/* Image du produit */}
                    <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{item.image}</span>
                    </div>

                    {/* Informations du produit */}
                    <div className="flex-1">
                      <h4 className="font-medium text-primary text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-dark mb-1">
                        {item.category}
                      </p>
                      <p className="font-semibold text-secondary">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Contrôles de quantité */}
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-8 h-8 bg-gray-light rounded-full flex items-center justify-center text-gray-dark hover:bg-accent/30 transition-colors duration-200"
                        aria-label="Diminuer la quantité"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium text-primary">
                        {item.quantity}
                      </span>
                      <button
                        className="w-8 h-8 bg-gray-light rounded-full flex items-center justify-center text-gray-dark hover:bg-accent/30 transition-colors duration-200"
                        aria-label="Augmenter la quantité"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      aria-label="Supprimer l'article"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer du panier */}
          {cartItems.length > 0 && (
            <div className="border-t border-accent/20 p-4 bg-background/30">
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-primary">
                  Total:
                </span>
                <span className="text-xl font-bold text-secondary">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <Link
                  href="/panier"
                  onClick={onClose}
                  className="block w-full text-center bg-accent text-primary px-4 py-3 rounded-lg font-medium hover:bg-accent/80 transition-colors duration-200"
                >
                  Voir le panier
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full text-center bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
                >
                  Passer la commande
                </Link>
              </div>

              {/* Livraison gratuite */}
              <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-secondary">
                  <span>🚚</span>
                  <span>Livraison gratuite à partir de 50 000 FCFA</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
