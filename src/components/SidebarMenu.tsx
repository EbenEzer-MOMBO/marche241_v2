import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  href: string;
}

interface SidebarMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarMenu({ isOpen = true, onClose }: SidebarMenuProps) {
  const categories: Category[] = [
    {
      id: 'electronics',
      name: 'Électronique',
      icon: '📱',
      href: '/categories/electronics'
    },
    {
      id: 'fashion',
      name: 'Mode',
      icon: '👕',
      href: '/categories/fashion'
    },
    {
      id: 'home',
      name: 'Maison',
      icon: '🏠',
      href: '/categories/home'
    },
    {
      id: 'beauty',
      name: 'Beauté',
      icon: '💄',
      href: '/categories/beauty'
    },
    {
      id: 'sports',
      name: 'Sport',
      icon: '⚽',
      href: '/categories/sports'
    },
    {
      id: 'books',
      name: 'Livres',
      icon: '📚',
      href: '/categories/books'
    }
  ];

  return (
    <>
      {/* Overlay pour mobile/tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-accent/20 z-40 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:block`}>
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
        <div className="p-4">
        {/* En-tête du menu */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">
            Catégories
          </h2>
          <div className="w-12 h-0.5 bg-secondary"></div>
        </div>

        {/* Liste des catégories */}
        <nav className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-dark hover:bg-accent/20 hover:text-primary transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </span>
              <span className="font-medium">
                {category.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* Section actions rapides */}
        <div className="mt-8 pt-6 border-t border-accent/20">
          <h3 className="text-sm font-semibold text-primary mb-3">
            Actions Rapides
          </h3>
          <div className="space-y-2">
            <Link
              href="/promotions"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">🏷️</span>
              <span>Promotions</span>
            </Link>
            <Link
              href="/nouveautes"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">✨</span>
              <span>Nouveautés</span>
            </Link>
            <Link
              href="/meilleures-ventes"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">🔥</span>
              <span>Meilleures ventes</span>
            </Link>
          </div>
        </div>

        {/* Support client */}
        <div className="mt-8 pt-6 border-t border-accent/20">
          <Link
            href="/contact"
            className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm"
          >
            <span>💬</span>
            <span>Support Client</span>
          </Link>
        </div>

        {/* Section informations */}
        {/*<div className="mt-8 pt-6 border-t border-accent/20">
          <h3 className="text-sm font-semibold text-primary mb-3">
            Informations
          </h3>
          <div className="space-y-2">
            <Link
              href="/about"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">ℹ️</span>
              <span>À propos</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">❓</span>
              <span>Aide</span>
            </Link>
            <Link
              href="/livraison"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">🚚</span>
              <span>Livraison</span>
            </Link>
            <Link
              href="/retours"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
            >
              <span className="text-lg">↩️</span>
              <span>Retours</span>
            </Link>
          </div>
        </div>*/}

        </div>
      </div>
    </aside>
    </>
  );
}
