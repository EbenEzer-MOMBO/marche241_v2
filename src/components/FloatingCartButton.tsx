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
        className="w-full py-4 rounded-2xl font-medium text-lg flex items-center justify-center space-x-4 transition-all duration-200 shadow-lg border-2 text-white"
        style={{
          backgroundColor: 'var(--primary-color)',
          borderColor: 'var(--primary-color)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--primary-color)';
          const badge = e.currentTarget.querySelector('.badge-inner') as HTMLElement;
          if (badge) {
            badge.style.backgroundColor = 'var(--primary-color)';
            badge.style.color = 'white';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary-color)';
          e.currentTarget.style.color = 'white';
          const badge = e.currentTarget.querySelector('.badge-inner') as HTMLElement;
          if (badge) {
            badge.style.backgroundColor = 'white';
            badge.style.color = 'var(--primary-color)';
          }
        }}
      >
        <span className="badge-inner rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-all duration-200" style={{ backgroundColor: 'white', color: 'var(--primary-color)' }}>
          {totalItems}
        </span>
        <span>Panier</span>
        <span>{formatPrice(totalPrix)}</span>
      </button>
    </div>
  );
}
