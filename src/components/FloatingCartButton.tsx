'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { usePanier } from '@/hooks/usePanier';
import { useBoutique } from '@/hooks/useBoutique';

interface FloatingCartButtonProps {
  onCartClick: () => void;
}

export default function FloatingCartButton({ onCartClick }: FloatingCartButtonProps) {
  const pathname = usePathname();
  
  // Extraire le boutiqueName depuis le pathname pour obtenir le boutiqueId
  const boutiqueName = pathname?.split('/')[1] || '';
  const { boutique } = useBoutique(boutiqueName);
  
  // Charger le panier avec isolation par boutique
  const { panier, totalItems, totalPrix, loading, rafraichir } = usePanier(boutique?.id);

  // Rafraîchir le panier au montage et écouter les changements
  useEffect(() => {
    rafraichir(); // Rafraîchir une fois au montage
    
    // Écouter les événements de changement du panier
    const handleCartUpdate = () => {
      rafraichir();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [rafraichir]);
  
  // Ne pas afficher sur les pages produit
  const isProductPage = pathname?.includes('/produit/');

  // Ne pas afficher le bouton s'il n'y a pas d'articles, si on est sur une page produit, ou pendant le chargement
  if (panier.length === 0 || isProductPage || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden">
      <button
        onClick={onCartClick}
        className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-4 hover:bg-primary/90 transition-colors duration-200 shadow-lg"
      >
        <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
          {totalItems}
        </span>
        <span>Panier</span>
        <span>{formatPrice(totalPrix)}</span>
      </button>
    </div>
  );
}
