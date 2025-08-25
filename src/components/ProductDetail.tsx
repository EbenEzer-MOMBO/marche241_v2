'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FloatingAddToCartButton from './FloatingAddToCartButton';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  variants: { label: string; options: string[] }[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);

  // Données de test pour le produit
  const product: Product = {
    id: productId,
    name: 'Initial Armandèse',
    price: 12500,
    originalPrice: 15000,
    images: ['/article2.webp', '/article1.webp', '/article3.webp', '/article4.webp'],
    description: 'Magnifique initial personnalisé en acier inoxydable de haute qualité. Parfait pour un cadeau unique et élégant.',
    category: 'Bijoux',
    variants: [
      {
        label: 'Initial',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      },
      {
        label: 'Couleur',
        options: ['Or', 'Argent', 'Rose Gold']
      }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 124
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

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
      productId,
      quantity,
      variants: selectedVariants
    });
  };

  return (
    <>
      <FloatingAddToCartButton
        productName={product.name}
        price={product.price}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        disabled={!product.inStock}
      />
      
    <div className="min-h-screen bg-white">
      {/* Navigation breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Accueil</Link>
            <span>/</span>
            <Link href="/produits" className="hover:text-primary">Produits</Link>
            <span>/</span>
            <span className="text-primary font-medium">{product.name}</span>
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
                src={product.images[selectedImageIndex]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Miniatures */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
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
                    alt={`${product.name} ${index + 1}`}
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
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Prix */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants.map((variant) => (
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
              {product.inStock ? (
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
                disabled={!product.inStock}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg lg:block hidden hover:bg-primary/90 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Ajouter au panier' : 'Produit indisponible'}
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
