'use client';

import { ReactNode, useState } from 'react';
import Header from './Header';
import CartSidebar from './CartSidebar';
import FloatingCartButton from './FloatingCartButton';
import { BoutiqueFooter } from './storefront/BoutiqueFooter';

interface MainLayoutProps {
  children: ReactNode;
  boutiqueName: string;
}

export default function MainLayout({ children, boutiqueName }: MainLayoutProps) {
  const [cartOpen, setCartOpen] = useState(false);

  const toggleCart = () => setCartOpen(!cartOpen);
  const closeCart = () => setCartOpen(false);

  return (
    <div className="min-h-screen bg-white text-[#17181a]">
      <Header onCartClick={toggleCart} boutiqueName={boutiqueName} />
      <CartSidebar
        isOpen={cartOpen}
        onClose={closeCart}
        boutiqueName={boutiqueName}
      />

      <main className="pt-[54px] sm:pt-[60px]">{children}</main>

      <BoutiqueFooter />

      <FloatingCartButton onCartClick={toggleCart} />
    </div>
  );
}
