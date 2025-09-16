'use client';

import { ReactNode, useState } from 'react';
import Header from './Header';
import SidebarMenu from './SidebarMenu';
import CartSidebar from './CartSidebar';
import FloatingCartButton from './FloatingCartButton';
import Footer from './Footer';
import { BoutiqueConfig } from '@/lib/boutiques';

interface MainLayoutProps {
  children: ReactNode;
  boutiqueName: string;
}

export default function MainLayout({ children, boutiqueName }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  
  const toggleCart = () => setCartOpen(!cartOpen);
  const closeCart = () => setCartOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onMenuClick={toggleSidebar} 
        onCartClick={toggleCart} 
        boutiqueName={boutiqueName}
      />
      <SidebarMenu isOpen={sidebarOpen} onClose={closeSidebar} />
      <CartSidebar isOpen={cartOpen} onClose={closeCart} boutiqueName={boutiqueName} />
      
      {/* Contenu principal avec marge pour le sidebar sur desktop */}
      <main className="lg:ml-64 transition-all duration-300">
        {children}
      </main>
      
      {/* Footer avec marge pour le sidebar sur desktop */}
      <div className="lg:ml-64 transition-all duration-300">
        <Footer />
      </div>

      {/* Bouton flottant du panier sur mobile */}
      <FloatingCartButton onCartClick={toggleCart} />
    </div>
  );
}
