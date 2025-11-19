'use client';

import Link from 'next/link';
import { useBoutique } from '@/hooks/useBoutique';
import { useProduitsParCategorie } from '@/hooks/useProduits';
import { formatPrix, getProduitImageUrl } from '@/lib/services/produits';
import SafeImage from './SafeImage';
import { Skeleton, SkeletonText } from './ui/Skeleton';
import { ErrorState } from './LoadingStates';

interface TrendingByCategoryProps {
  boutiqueName: string;
}

export default function TrendingByCategory({ boutiqueName }: TrendingByCategoryProps) {
  const { boutique, loading: boutiqueLoading, error: boutiqueError } = useBoutique(boutiqueName);
  const { categories, loading: categoriesLoading, error: categoriesError, refetch } = useProduitsParCategorie(boutique?.id || 0);

  // Squelette de chargement
  if (boutiqueLoading || categoriesLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <SkeletonText lines={2} className="max-w-2xl mx-auto" />
          </div>

          <div className="space-y-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shadow-md border border-gray-100 rounded-2xl p-6 lg:p-8">
                <div className="mb-8">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-white rounded-xl p-4">
                      <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                      <SkeletonText lines={2} />
                      <Skeleton className="h-4 w-20 mt-2" />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Skeleton className="h-10 w-32 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Gestion d'erreur
  if (boutiqueError || categoriesError || !boutique || !categories) {
    return (
      <ErrorState
        title="Impossible de charger les produits"
        message={boutiqueError || categoriesError || "Aucun produit trouvé"}
        onRetry={refetch}
      />
    );
  }

  // Pas de catégories
  if (Object.keys(categories).length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Produits Tendance</h2>
          <p className="text-gray-600">Aucun produit disponible pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Produits Tendance
          </h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            Découvrez les produits les plus populaires dans chaque catégorie,
            sélectionnés spécialement pour vous.
          </p>
        </div>

        {/* Sections par catégorie */}
        <div className="space-y-16">
          {Object.entries(categories).map(([slug, categorieData]) => (
            <div key={slug} className="shadow-md border border-gray-100 rounded-2xl p-6 lg:p-8">
              {/* En-tête de la catégorie */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-black">{categorieData.categorie.nom}</h3>
                </div>
              </div>

              {/* Grille des produits */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {categorieData.produits.slice(0, 4).map((produit) => (
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
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!produit.en_stock ? 'grayscale opacity-50' : ''
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

              {/* Bouton "Afficher tout" */}
              <div className="text-center">
                <Link
                  href={`/${boutiqueName}/produits?categorie=${categorieData.categorie.slug}`}
                  className="inline-flex items-center border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/90 hover:text-white transition-colors duration-200"
                >
                  Afficher tout ({categorieData.produits.length})
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
