'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { Boutique } from '@/lib/database-types';
import { Store, MapPin, Package, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { InstallAppButton } from '@/components/InstallAppButton';

const ITEMS_PER_PAGE = 12;

export default function MarchePage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [filteredBoutiques, setFilteredBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadBoutiques = async () => {
      try {
        setLoading(true);
        const data = await getAllBoutiquesActives();
        
        // Filtrer les boutiques avec au moins 1 produit ET avec une photo de profil
        const boutiquesAvecProduitsEtLogo = data.filter(boutique => 
          boutique.nombre_produits && 
          boutique.nombre_produits > 0 &&
          boutique.logo && 
          boutique.logo.trim() !== ''
        );
        
        // Trier par nombre de vues (décroissant)
        const boutiquesTries = boutiquesAvecProduitsEtLogo.sort((a, b) => {
          return (b.nombre_vues || 0) - (a.nombre_vues || 0);
        });
        
        setBoutiques(boutiquesTries);
        setFilteredBoutiques(boutiquesTries);
      } catch (err) {
        console.error('Erreur lors du chargement des boutiques:', err);
        setError('Impossible de charger les boutiques');
      } finally {
        setLoading(false);
      }
    };

    loadBoutiques();
  }, []);

  // Filtrer les boutiques par recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBoutiques(boutiques);
    } else {
      const filtered = boutiques.filter(boutique =>
        boutique.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boutique.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boutique.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBoutiques(filtered);
    }
    // Réinitialiser à la première page lors d'une nouvelle recherche
    setCurrentPage(1);
  }, [searchTerm, boutiques]);

  // Calculer la pagination
  const totalPages = Math.ceil(filteredBoutiques.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBoutiques = filteredBoutiques.slice(startIndex, endIndex);

  // Fonction pour changer de page
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/marche241_Web_with_text-01.svg" 
                alt="Marché241" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:bg-gradient-to-r hover:from-[#508e27] hover:to-[#74adaf] hover:bg-clip-text hover:text-transparent transition-colors font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/admin/register"
                className="px-6 py-2 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all font-medium"
              >
                Créer ma boutique
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Découvrez nos boutiques
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explorez les meilleures boutiques en ligne du Gabon
            </p>
            
            {/* Statistique 
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Store className="h-5 w-5 text-[#508e27]" />
              <span className="text-2xl font-bold text-gray-900">{boutiques.length}</span>
              <span className="text-gray-600">boutiques actives</span>
            </div>*/}
          </div>
        </div>
      </section>

      {/* Barre de recherche */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une boutique par nom, description ou adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#74adaf] focus:border-[#74adaf] transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          // État de chargement
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-[#508e27] animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Chargement des boutiques...</p>
          </div>
        ) : error ? (
          // État d'erreur
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Store className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600 text-lg">{error}</p>
          </div>
        ) : filteredBoutiques.length === 0 ? (
          // Aucun résultat
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Store className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Aucune boutique trouvée' : 'Aucune boutique disponible'}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Revenez plus tard'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all font-medium"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Résultats de recherche */}
            {searchTerm && (
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredBoutiques.length}</span> boutique{filteredBoutiques.length > 1 ? 's' : ''} trouvée{filteredBoutiques.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            {/* Grille des boutiques */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {currentBoutiques.map((boutique) => (
              <Link
                key={boutique.id}
                href={`/${boutique.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#74adaf] transform hover:-translate-y-1"
              >
                {/* Image de la boutique */}
                <div className="relative h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                  <Image
                    src={boutique.logo!}
                    alt={boutique.nom}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Badge statut */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                    ● Actif
                  </div>
                </div>

                {/* Informations de la boutique */}
                <div className="p-3 md:p-5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-[#508e27] group-hover:to-[#74adaf] group-hover:bg-clip-text group-hover:text-transparent transition-colors line-clamp-1">
                    {boutique.nom}
                  </h3>
                  
                  {boutique.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed hidden md:block">
                      {boutique.description}
                    </p>
                  )}

                  {/* Adresse */}
                  {boutique.adresse && (
                    <div className="flex items-start gap-2 text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 mt-0.5 flex-shrink-0 text-[#508e27]" />
                      <span className="line-clamp-1">{boutique.adresse}</span>
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
                      {boutique.nombre_produits !== undefined && (
                        <div className="flex items-center gap-1 md:gap-1.5 text-gray-700 font-medium">
                          <div className="p-0.5 md:p-1 bg-gradient-to-r from-[#508e27]/10 to-[#74adaf]/10 rounded">
                            <Package className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#508e27]" />
                          </div>
                          <span>{boutique.nombre_produits}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-gradient-to-r from-[#508e27] to-[#74adaf] bg-clip-text text-transparent font-semibold text-xs md:text-sm group-hover:gap-2 transition-all">
                      <span className="hidden md:inline">Visiter</span>
                      <svg className="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                {/* Bouton précédent */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-[#74adaf] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                {/* Numéros de page */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Afficher seulement quelques pages autour de la page actuelle
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white shadow-lg'
                              : 'border-2 border-gray-200 text-gray-700 hover:border-[#74adaf]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="flex items-center px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Bouton suivant */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-[#74adaf] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Info pagination */}
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} • {filteredBoutiques.length} boutique{filteredBoutiques.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      {!loading && !error && (
        <section className="bg-gradient-to-br from-gray-50 to-white py-16 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Vous aussi, créez votre boutique
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Rejoignez notre communauté de commerçants et développez votre activité en ligne
              </p>
              <Link
                href="/admin/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg font-medium text-lg"
              >
                Créer ma boutique gratuitement
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Bouton d'installation flottant */}
      <InstallAppButton />
    </div>
  );
}

