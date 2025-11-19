'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBoutique } from '@/hooks/useBoutique';
import { useCategories } from '@/hooks/useCategories';
import { getIconeCategorie } from '@/lib/services/categories';
import { Skeleton } from './ui/Skeleton';

interface SidebarMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarMenu({ isOpen = true, onClose }: SidebarMenuProps) {
  const params = useParams();
  const boutiqueName = params?.boutique as string;
  
  const { boutique, loading: boutiqueLoading } = useBoutique(boutiqueName);
  const { categoriesHierarchie: categories, loading: categoriesLoading } = useCategories(
    boutique?.id || 0,
    false, // Pas besoin de hiérarchie pour le sidebar
    true   // Uniquement les catégories actives
  );

  const isLoading = boutiqueLoading || categoriesLoading;

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
          {isLoading ? (
            // Squelettes de chargement
            Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center space-x-3 px-3 py-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((categorie) => (
              <Link
                key={categorie.id}
                href={`/${boutiqueName}/produits?categorie=${categorie.slug}`}
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-dark hover:bg-accent/20 hover:text-primary transition-all duration-200 group"
                onClick={onClose} // Fermer le sidebar sur mobile après clic
              >
                
                <span className="font-medium">
                  {categorie.nom}
                </span>
              </Link>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-gray-500">
              Aucune catégorie disponible
            </div>
          )}
        </nav>

        {/* Section actions rapides */}
        <div className="mt-8 pt-6 border-t border-accent/20">
          <h3 className="text-sm font-semibold text-primary mb-3">
            Actions Rapides
          </h3>
          <div className="space-y-2">
            <Link
              href={`/${boutiqueName}/produits?promotion=true`}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              onClick={onClose}
            >
              <span className="text-lg">🏷️</span>
              <span>Promotions</span>
            </Link>
            <Link
              href={`/${boutiqueName}/produits?nouveaux=true`}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              onClick={onClose}
            >
              <span className="text-lg">✨</span>
              <span>Nouveautés</span>
            </Link>
            <Link
              href={`/${boutiqueName}/produits?featured=true`}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-dark hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
              onClick={onClose}
            >
              <span className="text-lg">🔥</span>
              <span>Produits vedettes</span>
            </Link>
          </div>
        </div>

        {/* Support client */}
        <div className="mt-8 pt-6 border-t border-accent/20">
          <Link
            href="https://api.whatsapp.com/send/?phone=24104694721&text&type=phone_number&app_absent=0"
            className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm"
            target="_blank"
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
