'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Spinner, Minus, Plus, Trash, Check } from '@phosphor-icons/react';
import { formatPrice } from '@/lib/utils';
import { usePanier } from '@/hooks/usePanier';
import { getProduitImageUrl } from '@/lib/services/produits';
import { useState } from 'react';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  boutiqueName?: string;
}

export default function CartSidebar({ isOpen, onClose, boutiqueName = 'marche_241' }: CartSidebarProps) {
  // Hook pour gérer le panier
  const { 
    panier, 
    totalItems, 
    totalPrix, 
    loading, 
    error, 
    mettreAJourQuantite, 
    supprimerItem 
  } = usePanier();

  // État pour gérer les confirmations de suppression
  const [itemsToDelete, setItemsToDelete] = useState<Set<number>>(new Set());

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



  // Fonction pour formater les variants sélectionnés
  const formatVariants = (variants: { [key: string]: any } | null) => {
    if (!variants) return '';
    return Object.entries(variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // Fonction pour gérer la mise à jour de quantité
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await supprimerItem(itemId);
    } else {
      await mettreAJourQuantite(itemId, newQuantity);
    }
  };

  // Fonction pour gérer le clic sur supprimer
  const handleDeleteClick = (itemId: number) => {
    if (itemsToDelete.has(itemId)) {
      // Si déjà en mode confirmation, supprimer l'item
      handleConfirmDelete(itemId);
    } else {
      // Sinon, passer en mode confirmation
      setItemsToDelete(prev => new Set(prev).add(itemId));
      // Retirer le mode confirmation après 3 secondes
      setTimeout(() => {
        setItemsToDelete(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 3000);
    }
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = async (itemId: number) => {
    await supprimerItem(itemId);
    setItemsToDelete(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
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
              <X size={24} />
            </button>
          </div>

          {/* Contenu du panier */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              /* État de chargement */
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <Spinner className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Chargement du panier...</p>
                </div>
              </div>
            ) : error ? (
              /* État d'erreur */
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : panier.length === 0 ? (
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
                  href={`/${boutiqueName}`}
                  onClick={onClose}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Découvrir nos produits
                </Link>
              </div>
            ) : (
              <div className="p-4">
                {/* Articles du panier */}
                {panier.map((item) => (
                  <div key={item.id} className="mb-6">
                    <div className="flex items-start space-x-3">
                      {/* Image du produit */}
                      <div className="flex-shrink-0">
                        <Image
                          src={getProduitImageUrl(item.produit.image_principale)}
                          alt={item.produit.nom}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Informations du produit */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.produit.nom}
                            </h4>
                            {item.variants_selectionnes && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatVariants(item.variants_selectionnes)}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {formatPrice(item.produit.prix)}
                            </p>
                          </div>
                          
                          {/* Bouton supprimer */}
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className={`ml-2 transition-all duration-300 transform ${
                              itemsToDelete.has(item.id)
                                ? 'text-green-500 hover:text-green-600 scale-110'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            aria-label={itemsToDelete.has(item.id) ? "Confirmer la suppression" : "Supprimer l'article"}
                          >
                            {itemsToDelete.has(item.id) ? (
                              <Check size={18} className="animate-pulse" />
                            ) : (
                              <Trash size={18} />
                            )}
                          </button>
                        </div>

                        {/* Contrôles de quantité */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantite - 1)}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                              disabled={item.quantite <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                              {item.quantite}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantite + 1)}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                              disabled={item.quantite >= item.produit.quantite_stock}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          
                          {/* Prix total pour cet item */}
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.produit.prix * item.quantite)}
                          </span>
                        </div>
                      </div>
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
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Bouton ajouter */}
                        <button
                          className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors duration-200 flex-shrink-0"
                          aria-label="Ajouter au panier"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total et bouton de validation */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                    <span>Total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                    <span>{formatPrice(totalPrix)}</span>
                  </div>
                  
                  <Link 
                    href={`/${boutiqueName}/commande`}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-3 hover:bg-primary/90 transition-colors duration-200 text-decoration-none"
                    onClick={onClose}
                  >
                    <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {totalItems}
                    </span>
                    <span>Valider la commande</span>
                    <span>{formatPrice(totalPrix)}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
