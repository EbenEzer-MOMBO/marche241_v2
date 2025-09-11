'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import FloatingAddToCartButton from './FloatingAddToCartButton';
import { ProduitDetail } from '@/lib/database-types';
import { formatApiProduitPourDetail, formatVariantsPourInterface, getProduitImageUrl } from '@/lib/services/produits';

interface ProductDetailProps {
  productId?: string;
  productSlug?: string;
  productData?: ProduitDetail; // Données pré-chargées
  boutiqueSlug?: string;
}

export default function ProductDetail({ 
  productId, 
  productSlug, 
  productData, 
  boutiqueSlug 
}: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProduitDetail | null>(productData || null);
  const [loading, setLoading] = useState(!productData);
  const [error, setError] = useState<string | null>(null);

  // Charger les données du produit si elles ne sont pas pré-chargées
  useEffect(() => {
    if (productData) {
      setProduct(productData);
      setLoading(false);
      return;
    }

    // Si pas de données pré-chargées et pas d'ID/slug, afficher une erreur
    if (!productId && !productSlug) {
      setError('Aucun identifiant de produit fourni');
      setLoading(false);
      return;
    }

    // TODO: Implémenter l'appel API réel ici
    // Exemple d'implémentation :
    // const fetchProduct = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
    //     
    //     const response = await fetch(`/api/v1/produits/${productId || productSlug}`);
    //     const apiResponse = await response.json();
    //     
    //     const formattedProduct = formatApiProduitPourDetail(apiResponse);
    //     if (formattedProduct) {
    //       setProduct(formattedProduct);
    //     } else {
    //       setError('Produit introuvable');
    //     }
    //   } catch (err) {
    //     console.error('Erreur lors du chargement du produit:', err);
    //     setError('Erreur lors du chargement du produit');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchProduct();

    // Pour l'instant, afficher une erreur car pas d'API connectée
    setError('Veuillez fournir les données du produit via la prop productData');
    setLoading(false);
  }, [productId, productSlug, productData]);

  // État de chargement avec skeleton loader élégant [[memory:8540418]]
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skeleton pour galerie d'images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            {/* Skeleton pour informations */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Produit introuvable'}</p>
          <Link 
            href={boutiqueSlug ? `/${boutiqueSlug}` : '/'}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Formater les variantes pour l'interface
  const formattedVariants = formatVariantsPourInterface(product.variants || {});
  
  // Préparer les images
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => getProduitImageUrl(img))
    : [getProduitImageUrl(product.image_principale)];



  const handleVariantChange = (variantLabel: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantLabel]: option
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Logique d'ajout au panier
    console.log('Ajout au panier:', {
      productId: product.id,
      productSlug: product.slug,
      quantity,
      variants: selectedVariants
    });
  };

  return (
    <>
      <FloatingAddToCartButton
        productName={product.nom}
        price={product.prix}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        disabled={!product.en_stock}
      />
      
    <div className="min-h-screen bg-white">
      {/* Navigation breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href={boutiqueSlug ? `/${boutiqueSlug}` : '/'} className="hover:text-primary">
              Accueil
            </Link>
            <span>/</span>
            <Link href={boutiqueSlug ? `/${boutiqueSlug}/produits` : '/produits'} className="hover:text-primary">
              Produits
            </Link>
            <span>/</span>
            <Link href={boutiqueSlug ? `/${boutiqueSlug}/categories/${product.categorie.slug}` : `/categories/${product.categorie.slug}`} className="hover:text-primary">
              {product.categorie.nom}
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">{product.nom}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.nom}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-primary scale-105' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.nom} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            {/* En-tête */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{product.categorie.nom}</p>
                {product.est_nouveau && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.nom}</h1>
              
              {/* Prix */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.prix)}
                </span>
                {product.prix_original && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.prix_original)}
                  </span>
                )}
                {product.est_en_promotion && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Promotion
                  </span>
                )}
              </div>

              {/* Information boutique */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                {product.boutique.logo && (
                  <Image
                    src={product.boutique.logo}
                    alt={product.boutique.nom}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.boutique.nom}</p>
                  {product.boutique.adresse && (
                    <p className="text-xs text-gray-600">{product.boutique.adresse}</p>
                  )}
                </div>
                {product.boutique.note_moyenne > 0 && (
                  <div className="flex items-center space-x-1 ml-auto">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">{product.boutique.note_moyenne}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {/*{product.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(product.rating!) 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} avis)
                  </span>
                </div>
              )}*/}
            </div>

            {/* Description */}
            {(product.description || product.description_courte) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || product.description_courte}
                </p>
              </div>
            )}

            {/* Variants */}
            {formattedVariants.length > 0 && formattedVariants.map((variant) => (
              <div key={variant.label}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{variant.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVariantChange(variant.label, option)}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                        selectedVariants[variant.label] === option
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Informations supplémentaires */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Informations du produit</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <span className="text-gray-600">SKU:</span>
                    <span className="ml-2 font-medium">{product.sku}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Stock:</span>
                  <span className="ml-2 font-medium">{product.quantite_stock} unité(s)</span>
                </div>
                {product.poids && (
                  <div>
                    <span className="text-gray-600">Poids:</span>
                    <span className="ml-2 font-medium">{product.poids}g</span>
                  </div>
                )}
                {product.nombre_ventes > 0 && (
                  <div>
                    <span className="text-gray-600">Vendus:</span>
                    <span className="ml-2 font-medium">{product.nombre_ventes}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantité */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantité</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                  disabled={quantity <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 12H4"></path>
                  </svg>
                </button>
                <span className="text-xl font-medium text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Statut de stock */}
            <div className="flex items-center space-x-2">
              {product.en_stock ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">En stock</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Rupture de stock</span>
                </>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={!product.en_stock}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg lg:block hidden hover:bg-primary/90 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product.en_stock ? 'Ajouter au panier' : 'Produit indisponible'}
              </button>
              
            </div>

            {/* Informations supplémentaires */}
            {/*<div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span>Livraison gratuite à partir de 50 000 FCFA</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Garantie 1 an</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Retour possible sous 30 jours</span>
              </div>
            </div>*/}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
