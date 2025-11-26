'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { getProduitsParBoutique } from '@/lib/services/products';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { getCommunesParBoutique } from '@/lib/services/communes';
import Image from 'next/image';
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
  User,
  CreditCard,
  Share2,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

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
  const [isCopied, setIsCopied] = useState(false);
  const [alerts, setAlerts] = useState({
    categories: false,
    produits: false,
    livraison: false
  });

  // Hook pour les toasts
  const { toasts, removeToast, success, error: showError } = useToast();

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
      name: 'Paiements',
      href: `/admin/${boutique.slug}/payments`,
      icon: CreditCard,
      current: pathname.includes('/payments')
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

  const handleCopyLink = async () => {
    const boutiqueUrl = `${window.location.origin}/${boutique.slug}`;
    try {
      // Méthode 1 : Utiliser l'API Clipboard moderne (préférée)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(boutiqueUrl);
        setIsCopied(true);
        success('Lien copié !', 'Succès', 2000);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Méthode 2 : Fallback pour les navigateurs plus anciens ou contextes non sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = boutiqueUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setIsCopied(true);
            success('Lien copié !', 'Succès', 2000);
            setTimeout(() => setIsCopied(false), 2000);
          } else {
            throw new Error('Copy command was unsuccessful');
          }
        } catch (err) {
          console.error('Fallback: Erreur lors de la copie', err);
          showError('Impossible de copier le lien', 'Erreur', 3000);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      showError('Impossible de copier le lien', 'Erreur', 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const boutiqueUrl = `${window.location.origin}/${boutique.slug}`;
    const message = `Découvrez ma boutique ${boutique.nom} : ${boutiqueUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
          <a
            href={`/${boutique.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            {boutique.logo ? (
              <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-gray-100">
                <Image
                  src={boutique.logo}
                  alt={boutique.nom}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <Store className="h-10 w-10 text-black mr-3 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {boutique.nom}
                </h1>
                <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                <span className="hidden sm:inline">{boutique.adresse}</span>
                <span className="sm:hidden">Voir la boutique</span>
              </p>
            </div>
          </a>
        )}
        
        {isCollapsed && boutique.logo && (
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 mx-auto">
            <Image
              src={boutique.logo}
              alt={boutique.nom}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {isCollapsed && !boutique.logo && (
          <Store className="h-10 w-10 text-black mx-auto" />
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
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

      {/* Share section */}
      <div className="border-t border-gray-200 p-2">
        {!isCollapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Partager ma boutique via
          </p>
        )}
        <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2 px-3 py-2`}>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1"
            title="Partager sur WhatsApp"
          >
            <svg className={`h-3 w-3 ${isCollapsed ? '' : 'mr-2'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {!isCollapsed && <span className="text-xs font-medium">WhatsApp</span>}
          </button>
          
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex-1"
            title="Copier le lien"
          >
            {isCopied ? (
              <>
                <Check className={`h-3 w-3 ${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span className="text-xs font-medium">Copié !</span>}
              </>
            ) : (
              <>
                <Copy className={`h-3 w-3 ${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span className="text-xs font-medium">Copier</span>}
              </>
            )}
          </button>
        </div>
      </div>

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
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname.includes('/settings')
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
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

