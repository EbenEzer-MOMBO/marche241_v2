'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useBoutique } from '@/hooks/useBoutique';
import { formatPrix, getProduitImageUrl, getProduitsParBoutique } from '@/lib/services/produits';
import { ProduitDB } from '@/lib/database-types';
import SafeImage from '@/components/SafeImage';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/LoadingStates';
import { Filter, X, Search } from 'lucide-react';

interface Categorie {
  id: number;
  nom: string;
  slug: string;
}

export default function ProduitsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const boutiqueName = params.boutique as string;
  const categorieSlug = searchParams.get('categorie');

  const { boutique, loading: boutiqueLoading, error: boutiqueError } = useBoutique(boutiqueName);
  
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(categorieSlug);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'name'>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'out-stock'>('all');
  const [filterType, setFilterType] = useState<'all' | 'nouveau' | 'promo' | 'featured'>('all');

  // Charger les produits
  useEffect(() => {
    const loadProduits = async () => {
      if (!boutique?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getProduitsParBoutique(boutique.id, {
          limite: 100 // Charger tous les produits
        });
        
        setProduits(response.produits || []);

        // Extraire les catégories uniques
        const uniqueCategories = Array.from(
          new Map(
            response.produits
              .filter((p: ProduitDB) => p.categorie)
              .map((p: ProduitDB) => [p.categorie!.id, p.categorie!])
          ).values()
        ) as Categorie[];
        
        setCategories(uniqueCategories);
      } catch (err: any) {
        console.error('Erreur lors du chargement des produits:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduits();
  }, [boutique?.id]);

  // Filtrer et trier les produits
  const filteredAndSortedProduits = produits
    .filter(produit => {
      // Filtre par catégorie
      if (selectedCategorie && produit.categorie?.slug !== selectedCategorie) {
        return false;
      }
      
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchNom = produit.nom.toLowerCase().includes(searchLower);
        const matchDescription = produit.description?.toLowerCase().includes(searchLower);
        if (!matchNom && !matchDescription) return false;
      }
      
      // Filtre par stock
      if (filterStock === 'in-stock' && !produit.en_stock) return false;
      if (filterStock === 'out-stock' && produit.en_stock) return false;
      
      // Filtre par type
      if (filterType === 'nouveau' && !produit.est_nouveau) return false;
      if (filterType === 'promo' && !produit.est_en_promotion) return false;
      if (filterType === 'featured' && !produit.est_featured) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.prix - b.prix;
        case 'price-desc':
          return b.prix - a.prix;
        case 'name':
          return a.nom.localeCompare(b.nom);
        case 'recent':
        default:
          return b.id - a.id;
      }
    });

  const handleCategorieChange = (slug: string | null) => {
    setSelectedCategorie(slug);
    
    // Mettre à jour l'URL
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('categorie', slug);
    } else {
      url.searchParams.delete('categorie');
    }
    window.history.pushState({}, '', url.toString());
  };

  if (boutiqueLoading || loading) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          
          <div className="flex gap-8">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <Skeleton className="h-48 w-full" />
            </div>
            
            {/* Products grid skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                    <SkeletonText lines={2} />
                    <Skeleton className="h-4 w-20 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (boutiqueError || error || !boutique) {
    return (
      <MainLayout boutiqueName={boutiqueName}>
        <ErrorState
          title="Impossible de charger les produits"
          message={boutiqueError || error || "Une erreur est survenue"}
          onRetry={() => window.location.reload()}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout boutiqueName={boutiqueName}>
      <div className="bg-gray-50 min-h-screen pt-20 pb-8 sm:pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Tous les Produits
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredAndSortedProduits.length} produit{filteredAndSortedProduits.length > 1 ? 's' : ''} disponible{filteredAndSortedProduits.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Barre de recherche - Visible sur tous les écrans */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Panneau horizontal - Mobile */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                {/* Catégories */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Catégories</label>
                  <select
                    value={selectedCategorie || ''}
                    onChange={(e) => handleCategorieChange(e.target.value || null)}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Toutes</option>
                    {categories.map((categorie) => (
                      <option key={categorie.id} value={categorie.slug}>
                        {categorie.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disponibilité */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value as any)}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="in-stock">En stock</option>
                    <option value="out-stock">Épuisés</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="nouveau">Nouveautés</option>
                    <option value="promo">Promos</option>
                    <option value="featured">Vedettes</option>
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="recent">Récents</option>
                    <option value="price-asc">Prix ↑</option>
                    <option value="price-desc">Prix ↓</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-4 shadow-sm sticky top-32">
                {/* Catégories */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Catégories</h3>
                  <select
                    value={selectedCategorie || ''}
                    onChange={(e) => handleCategorieChange(e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Toutes ({produits.length})</option>
                    {categories.map((categorie) => {
                      const count = produits.filter(p => p.categorie?.slug === categorie.slug).length;
                      return (
                        <option key={categorie.id} value={categorie.slug}>
                          {categorie.nom} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Disponibilité */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Disponibilité</h3>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="in-stock">En stock</option>
                    <option value="out-stock">Épuisés</option>
                  </select>
                </div>

                {/* Type de produit */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Type</h3>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="nouveau">Nouveautés</option>
                    <option value="promo">En promotion</option>
                    <option value="featured">Produits vedettes</option>
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Trier par</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Grille des produits */}
            <div className="flex-1">
              {filteredAndSortedProduits.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
                  {selectedCategorie && (
                    <button
                      onClick={() => handleCategorieChange(null)}
                      className="mt-4 text-primary hover:underline"
                    >
                      Voir tous les produits
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredAndSortedProduits.map((produit) => (
                    <Link
                      key={produit.id}
                      href={`/${boutiqueName}/produit/${produit.id}`}
                      className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      {/* Image du produit */}
                      <div className="relative mb-3">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <SafeImage
                            src={getProduitImageUrl(produit.image_principale)}
                            alt={produit.nom}
                            width={200}
                            height={200}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              !produit.en_stock ? 'grayscale opacity-50' : ''
                            }`}
                          />

                          {/* Overlay stock épuisé */}
                          {!produit.en_stock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                                  Épuisé
                                </div>
                                <p className="text-white text-xs">
                                  Stock indisponible
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        {produit.en_stock && (
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {produit.est_nouveau && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Nouveau
                              </span>
                            )}
                            {produit.est_en_promotion && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Promo
                              </span>
                            )}
                            {produit.est_featured && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Vedette
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Informations du produit */}
                      <div>
                        {/* Nom du produit */}
                        <h4 className="text-black font-medium text-sm mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-200">
                          {produit.nom}
                        </h4>

                        {/* Prix */}
                        <div className="flex flex-col gap-1">
                          <span className="text-black font-semibold text-sm">
                            {formatPrix(produit.prix)}
                          </span>
                          {produit.prix_original && produit.prix_original !== produit.prix && (
                            <span className="text-gray-medium line-through text-xs">
                              {formatPrix(produit.prix_original)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
