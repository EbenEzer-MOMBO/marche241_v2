'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { getProduitsParBoutique } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { getCommunesParBoutique } from '@/lib/services/communes';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  Tags,
  Truck,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface SidebarProps {
  boutique: BoutiqueData;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  showAlert?: boolean;
}

export default function Sidebar({ boutique, isMobileMenuOpen = false, onToggleMobileMenu }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState({
    categories: false,
    produits: false,
    livraison: false
  });

  // Charger les alertes au montage
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        // Vérifier les catégories
        const categoriesData = await getCategoriesParBoutique(boutique.id);
        
        // Vérifier les produits
        const produitsData = await getProduitsParBoutique(boutique.id, { limite: 1 });
        
        // Vérifier les zones de livraison
        const communesData = await getCommunesParBoutique(boutique.id);
        
        setAlerts({
          categories: categoriesData.length === 0,
          produits: produitsData.total === 0,
          livraison: communesData.length === 0
        });
      } catch (error) {
        console.error('Erreur lors de la vérification des alertes:', error);
      }
    };

    checkAlerts();
  }, [boutique.id]);

  const navigation: NavItem[] = [
    {
      name: 'Tableau de bord',
      href: `/admin/${boutique.slug}`,
      icon: LayoutDashboard,
      current: pathname === `/admin/${boutique.slug}`,
      showAlert: false
    },
    {
      name: 'Catégories',
      href: `/admin/${boutique.slug}/categories`,
      icon: Tags,
      current: pathname.includes('/categories'),
      showAlert: alerts.categories
    },
    {
      name: 'Produits',
      href: `/admin/${boutique.slug}/products`,
      icon: Package,
      current: pathname.includes('/products'),
      showAlert: alerts.produits
    },
    {
      name: 'Commandes',
      href: `/admin/${boutique.slug}/orders`,
      icon: ShoppingBag,
      current: pathname.includes('/orders')
    },
    {
      name: 'Frais livraison',
      href: `/admin/${boutique.slug}/shipping`,
      icon: Truck,
      current: pathname.includes('/shipping'),
      showAlert: alerts.livraison
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleMobileMenu}
        />
      )}
      
      <div className={`bg-white shadow-sm border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } fixed left-0 top-0 z-50 lg:relative lg:z-auto transform lg:transform-none ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <Store className="h-8 w-8 text-black mr-3" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {boutique.nom}
              </h1>
              <p className="text-sm text-gray-500 truncate">{boutique.adresse}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                item.current
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}
              {item.showAlert && (
                <span className={`flex-shrink-0 ${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}`}>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-2">
        {/* User info */}
        <div className={`flex items-center px-3 py-2 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        {/* Settings and Logout */}
        <div className="space-y-1">
          <button
            onClick={() => router.push(`/admin/${boutique.slug}/settings`)}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Settings className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>Paramètres</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

