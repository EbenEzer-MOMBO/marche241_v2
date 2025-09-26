'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
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
}

export default function Sidebar({ boutique, isMobileMenuOpen = false, onToggleMobileMenu }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation: NavItem[] = [
    {
      name: 'Tableau de bord',
      href: `/admin/${boutique.slug}`,
      icon: LayoutDashboard,
      current: pathname === `/admin/${boutique.slug}`
    },
    {
      name: 'Catégories',
      href: `/admin/${boutique.slug}/categories`,
      icon: Tags,
      current: pathname.includes('/categories')
    },
    {
      name: 'Produits',
      href: `/admin/${boutique.slug}/products`,
      icon: Package,
      current: pathname.includes('/products')
    },
    {
      name: 'Commandes',
      href: `/admin/${boutique.slug}/orders`,
      icon: ShoppingCart,
      current: pathname.includes('/orders')
    },
    {
      name: 'Frais livraison',
      href: `/admin/${boutique.slug}/shipping`,
      icon: Truck,
      current: pathname.includes('/shipping')
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
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
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

