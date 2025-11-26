'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { Boutique } from '@/lib/database-types';
import { Store, MapPin, Star, Package, Search, Loader2 } from 'lucide-react';

export default function MarchePage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [filteredBoutiques, setFilteredBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoutiques = async () => {
      try {
        setLoading(true);
        const data = await getAllBoutiquesActives();
        
        // Filtrer les boutiques avec au moins 1 produit
        const boutiquesAvecProduits = data.filter(boutique => 
          boutique.nombre_produits && boutique.nombre_produits > 0
        );
        
        // Trier: boutique ID 1 en premier, puis les autres par ordre décroissant de produits
        const boutiquesTries = boutiquesAvecProduits.sort((a, b) => {
          // La boutique ID 1 toujours en premier
          if (a.id === 1) return -1;
          if (b.id === 1) return 1;
          
          // Sinon, trier par nombre de produits (décroissant)
          return (b.nombre_produits || 0) - (a.nombre_produits || 0);
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
  }, [searchTerm, boutiques]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Marché 241
              </h1>
              <p className="text-gray-600 mt-2">
                Découvrez nos boutiques partenaires
              </p>
            </div>
            
            {/* Statistiques */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{boutiques.length}</div>
                <div className="text-sm text-gray-600">Boutiques</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          // État de chargement
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Chargement des boutiques...</p>
          </div>
        ) : error ? (
          // État d'erreur
          <div className="text-center py-20">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredBoutiques.length === 0 ? (
          // Aucun résultat
          <div className="text-center py-20">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Aucune boutique trouvée' : 'Aucune boutique disponible'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Essayez avec d\'autres mots-clés' : 'Revenez plus tard'}
            </p>
          </div>
        ) : (
          // Grille des boutiques
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBoutiques.map((boutique) => (
              <Link
                key={boutique.id}
                href={`/${boutique.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
              >
                {/* Image de la boutique */}
                <div className="relative h-48 overflow-hidden">
                  {boutique.logo ? (
                    <Image
                      src={boutique.logo}
                      alt={boutique.nom}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Store className="h-20 w-20 text-emerald-600 opacity-50" />
                    </div>
                  )}
                  
                  {/* Badge statut */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Actif
                  </div>
                </div>

                {/* Informations de la boutique */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {boutique.nom}
                  </h3>
                  
                  {boutique.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {boutique.description}
                    </p>
                  )}

                  {/* Adresse */}
                  {boutique.adresse && (
                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{boutique.adresse}</span>
                    </div>
                  )}

                  {/* Statistiques */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm">
                      {boutique.nombre_produits !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{boutique.nombre_produits}</span>
                        </div>
                      )}
                      
                      {boutique.note_moyenne !== undefined && boutique.note_moyenne > 0 && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{boutique.note_moyenne.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Visiter →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

