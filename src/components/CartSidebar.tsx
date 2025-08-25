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
  variant?: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
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
      name: 'Initial Armandèse',
      price: 12500,
      quantity: 1,
      image: '/article2.webp',
      category: 'Mode',
      variant: 'Initial : D'
    }
  ];

  // Produits recommandés
  const recommendedProducts: RecommendedProduct[] = [
    {
      id: '2',
      name: 'Leyla set ( boucle + bracelet +Collier )',
      price: 15500,
      image: '/article1.webp'
    },
    {
      id: '3', 
      name: 'Your Princess Ring',
      price: 25500,
      image: '/article3.webp'
    },
    {
      id: '4',
      name: 'Pinky Bow ring',
      price: 26500,
      image: '/article4.webp'
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
      <aside className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="h-full flex flex-col">
          {/* En-tête du panier */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Panier</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              /* Panier vide */
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Votre panier est vide
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez nos produits et ajoutez-les à votre panier
                </p>
                <Link
                  href="/produits"
                  onClick={onClose}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Découvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="p-4">
                {/* Articles du panier */}
                {cartItems.map((item) => (
                  <div key={item.id} className="mb-6">
                    <div className="flex items-start space-x-3">
                      {/* Bouton supprimer en haut à droite */}
                      <div className="flex-1 flex items-start space-x-3">
                        {/* Image du produit */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={80} 
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Informations du produit */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-lg font-semibold text-gray-900 mb-2">
                            {item.price.toLocaleString()} FCFA
                          </p>
                          {item.variant && (
                            <p className="text-sm text-gray-500 italic mb-3">
                              • {item.variant}
                            </p>
                          )}
                          
                          {/* Contrôles de quantité */}
                          <div className="flex items-center space-x-3 mt-3">
                            <button
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                              aria-label="Diminuer la quantité"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M20 12H4"></path>
                              </svg>
                            </button>
                            <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                              aria-label="Augmenter la quantité"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bouton supprimer */}
                      <button
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
                        aria-label="Supprimer l'article"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Section "Les gens ont aussi acheté" */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Les gens ont aussi acheté
                  </h3>
                  <div className="space-y-4">
                    {recommendedProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3">
                        {/* Image du produit */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={48} 
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Informations du produit */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.price.toLocaleString()} FCFA
                          </p>
                        </div>

                        {/* Bouton ajouter */}
                        <button
                          className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0"
                          aria-label="Ajouter au panier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 4v16m8-8H4"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer du panier avec bouton de validation */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-3 hover:bg-primary/90 transition-colors duration-200">
                <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {getTotalItems()}
                </span>
                <span>Valider la commande</span>
                <span>{getTotalPrice().toLocaleString()} FCFA</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
