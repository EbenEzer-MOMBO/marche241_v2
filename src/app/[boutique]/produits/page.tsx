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
      <div className="bg-gray-50 min-h-screen pt-20 pb-8 sm:pt-24 lg:pt-8">
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

          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                {/* Catégories */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Catégories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategorieChange(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        !selectedCategorie
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Toutes ({produits.length})
                    </button>
                    {categories.map((categorie) => {
                      const count = produits.filter(p => p.categorie?.slug === categorie.slug).length;
                      return (
                        <button
                          key={categorie.id}
                          onClick={() => handleCategorieChange(categorie.slug)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCategorie === categorie.slug
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {categorie.nom} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Disponibilité */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Disponibilité</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilterStock('all')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterStock === 'all'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setFilterStock('in-stock')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterStock === 'in-stock'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      En stock
                    </button>
                    <button
                      onClick={() => setFilterStock('out-stock')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterStock === 'out-stock'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Épuisés
                    </button>
                  </div>
                </div>

                {/* Type de produit */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Type</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterType === 'all'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setFilterType('nouveau')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterType === 'nouveau'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Nouveautés
                    </button>
                    <button
                      onClick={() => setFilterType('promo')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterType === 'promo'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      En promotion
                    </button>
                    <button
                      onClick={() => setFilterType('featured')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        filterType === 'featured'
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Produits vedettes
                    </button>
                  </div>
                </div>

                {/* Tri */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Trier par</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Filtres - Mobile */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Filter className="h-6 w-6" />
              </button>
            </div>

            {/* Modal filtres mobile */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-black">Filtres</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Catégories */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-black mb-3">Catégories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleCategorieChange(null);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          !selectedCategorie
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Toutes ({produits.length})
                      </button>
                      {categories.map((categorie) => {
                        const count = produits.filter(p => p.categorie?.slug === categorie.slug).length;
                        return (
                          <button
                            key={categorie.id}
                            onClick={() => {
                              handleCategorieChange(categorie.slug);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                              selectedCategorie === categorie.slug
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {categorie.nom} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Disponibilité */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-black mb-3">Disponibilité</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => { setFilterStock('all'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterStock === 'all' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => { setFilterStock('in-stock'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterStock === 'in-stock' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        En stock
                      </button>
                      <button
                        onClick={() => { setFilterStock('out-stock'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterStock === 'out-stock' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Épuisés
                      </button>
                    </div>
                  </div>

                  {/* Type de produit */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-black mb-3">Type</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => { setFilterType('all'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterType === 'all' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => { setFilterType('nouveau'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterType === 'nouveau' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Nouveautés
                      </button>
                      <button
                        onClick={() => { setFilterType('promo'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterType === 'promo' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        En promotion
                      </button>
                      <button
                        onClick={() => { setFilterType('featured'); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          filterType === 'featured' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Produits vedettes
                      </button>
                    </div>
                  </div>

                  {/* Tri */}
                  <div>
                    <h4 className="font-semibold text-black mb-3">Trier par</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="recent">Plus récents</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="name">Nom A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

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
                              <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-medium">
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
