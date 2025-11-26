'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import FloatingAddToCartButton from './FloatingAddToCartButton';
import { ProduitDetail, ProduitAffichage, Boutique } from '@/lib/database-types';
import { formatApiProduitPourDetail, formatVariantsPourInterface, getProduitImageUrl } from '@/lib/services/produits';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

interface ProductDetailProps {
  productId: string;
  productData: ProduitDetail;
  productDisplay: ProduitAffichage;
  boutiqueSlug: string;
  boutiqueData: Boutique;
}

export default function ProductDetail({
  productId,
  productData,
  productDisplay,
  boutiqueSlug,
  boutiqueData
}: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProduitDetail | null>(productData || null);
  const [loading, setLoading] = useState(!productData);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Hook pour l'ajout au panier
  const { ajouterProduit, loading: panierLoading, error: panierError } = useAjoutPanier();

  // Hook pour les toasts
  const { toasts, removeToast, success, error: showError } = useToast();

  // Charger les données du produit si elles ne sont pas pré-chargées
  useEffect(() => {
    if (productData) {
      setProduct(productData);
      setLoading(false);
      return;
    }

    // Si pas de données pré-chargées et pas d'ID, afficher une erreur
    if (!productId) {
      setError('Aucun identifiant de produit fourni');
      setLoading(false);
      return;
    }

    // Note: L'implémentation de l'appel API a été déplacée vers la page serveur

    // Pour l'instant, afficher une erreur car pas d'API connectée
    setError('Veuillez fournir les données du produit via la prop productData');
    setLoading(false);
  }, [productId, productData]);

  // Sélection automatique du premier élément de chaque variant
  useEffect(() => {
    if (product) {
      const initialVariants: { [key: string]: string } = {};

      // Nouveau format: variants est un objet avec { variants: [...], options: [...] }
      if (product.variants && typeof product.variants === 'object') {
        if ('variants' in product.variants && Array.isArray(product.variants.variants)) {
          // Structure combinée: { variants: ProductVariant[], options: ProductOption[] }
          const variantsList = product.variants.variants;
          if (variantsList.length > 0) {
            // Sélectionner le premier variant par défaut
            initialVariants['variant'] = variantsList[0].nom;
          }
        }
      }

      setSelectedVariants(initialVariants);
    }
  }, [product]);

  // Réinitialiser la quantité quand le variant change
  useEffect(() => {
    const maxQty = getMaxQuantity();
    if (quantity > maxQty) {
      setQuantity(Math.max(1, maxQty));
    }
  }, [selectedVariants]);

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

  // Préparer les images (produit + variants)
  const prepareProductImages = () => {
    const baseImages = product.images && product.images.length > 0
      ? product.images.map(img => getProduitImageUrl(img))
      : [getProduitImageUrl(product.image_principale)];

    // Ajouter les images des variants
    if (product.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      const variantImages = product.variants.variants
        .filter((v: any) => v.image)
        .map((v: any) => getProduitImageUrl(v.image));

      return [...baseImages, ...variantImages];
    }

    return baseImages;
  };

  const productImages = prepareProductImages();

  // Obtenir le variant sélectionné
  const getSelectedVariant = () => {
    if (product?.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      const selectedVariantName = selectedVariants['variant'];
      if (selectedVariantName) {
        return product.variants.variants.find((v: any) => v.nom === selectedVariantName);
      }
      return product.variants.variants[0]; // Premier variant par défaut
    }
    return null;
  };

  // Obtenir le prix à afficher (prix promo si existe, sinon prix normal)
  const getDisplayPrice = () => {
    const selectedVariant = getSelectedVariant();

    // Si variant avec prix promo, afficher le prix promo
    if (selectedVariant && selectedVariant.prix_promo) {
      return selectedVariant.prix_promo;
    }

    // Si variant avec prix normal, afficher le prix normal
    if (selectedVariant && selectedVariant.prix) {
      return selectedVariant.prix;
    }

    // Si produit avec prix promo, afficher le prix promo
    if (product.prix_original) {
      return product.prix;
    }

    // Sinon afficher le prix normal du produit
    return product.prix;
  };

  // Obtenir le prix original (barré) si un prix promo existe
  const getOriginalPrice = () => {
    const selectedVariant = getSelectedVariant();

    // Si variant avec prix promo, afficher le prix normal du variant
    if (selectedVariant && selectedVariant.prix_promo && selectedVariant.prix) {
      return selectedVariant.prix;
    }

    // Si produit avec prix promo, afficher le prix original
    if (product.prix_original) {
      return product.prix_original;
    }

    return null;
  };

  const handleVariantChange = (variantLabel: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantLabel]: option
    }));

    // Sélectionner l'image du variant si elle existe
    if (product?.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      const variant = product.variants.variants.find((v: any) => v.nom === option);
      if (variant && variant.image) {
        const variantImageUrl = getProduitImageUrl(variant.image);
        const imageIndex = productImages.indexOf(variantImageUrl);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    document.body.style.overflow = 'auto';
  };

  const navigateFullscreen = (direction: 'prev' | 'next') => {
    if (!productImages) return;

    if (direction === 'prev') {
      setFullscreenImageIndex((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    } else {
      setFullscreenImageIndex((prev) =>
        prev === productImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Gérer les touches du clavier pour le fullscreen
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      if (e.key === 'ArrowLeft') navigateFullscreen('prev');
      if (e.key === 'ArrowRight') navigateFullscreen('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      // Limiter la quantité au stock disponible
      const maxQuantity = product?.quantite_stock || 1;
      const limitedQuantity = Math.min(newQuantity, maxQuantity);
      setQuantity(limitedQuantity);
    }
  };

  // Fonction pour obtenir la quantité maximale disponible
  const getMaxQuantity = () => {
    // Nouveau format: variants est un objet avec { variants: [...], options: [...] }
    if (product?.variants && typeof product.variants === 'object') {
      if ('variants' in product.variants && Array.isArray(product.variants.variants)) {
        const variantsList = product.variants.variants;
        const selectedVariantName = selectedVariants['variant'];

        if (selectedVariantName) {
          // Trouver le variant sélectionné
          const selectedVariant = variantsList.find(v => v.nom === selectedVariantName);
          if (selectedVariant && selectedVariant.quantite !== undefined) {
            return selectedVariant.quantite;
          }
        }

        // Par défaut, retourner la quantité du premier variant
        if (variantsList.length > 0 && variantsList[0].quantite !== undefined) {
          return variantsList[0].quantite;
        }
      }
    }

    // Sinon, utiliser le stock global
    return product?.quantite_stock || 1;
  };

  // Fonction pour vérifier si on peut augmenter la quantité
  const canIncreaseQuantity = () => {
    return quantity < getMaxQuantity();
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAddingToCart(true);

      // Valider les options requises
      if (product.variants && typeof product.variants === 'object' && 'options' in product.variants) {
        const requiredOptions = product.variants.options?.filter((o: any) => o.required) || [];
        for (const option of requiredOptions) {
          if (!selectedOptions[option.nom] || selectedOptions[option.nom].trim() === '') {
            showError(`${option.nom} est requis`, 'Erreur', 5000);
            setIsAddingToCart(false);
            return;
          }
        }
      }

      // Obtenir le variant sélectionné avec toutes ses données
      const selectedVariant = getSelectedVariant();

      // Préparer les données pour le panier
      const cartData: any = {};

      // Ajouter les données du variant si présent
      if (selectedVariant) {
        cartData.variant = {
          nom: selectedVariant.nom,
          prix: selectedVariant.prix_promo || selectedVariant.prix,
          prix_original: selectedVariant.prix_promo ? selectedVariant.prix : null,
          image: selectedVariant.image
        };
      }

      // Ajouter les options si présentes
      if (Object.keys(selectedOptions).length > 0) {
        cartData.options = selectedOptions;
      }

      // Construire le message
      let message = `${product.nom} ajouté au panier`;
      if (selectedVariant) {
        message = `${product.nom} (${selectedVariant.nom}) ajouté au panier`;
      }

      const isSuccess = await ajouterProduit(
        product.boutique.id,
        product.id,
        quantity,
        cartData
      );

      if (isSuccess) {
        success(message, 'Succès', 4000);
        // Réinitialiser les options après ajout
        setSelectedOptions({});
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Afficher les erreurs du panier via toast
  useEffect(() => {
    if (panierError) {
      showError(panierError, 'Erreur', 5000);
    }
  }, [panierError, showError]);

  // Fonctions de partage
  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}/${boutiqueSlug}/produit/${productId}`;
    
    try {
      // Méthode 1 : Utiliser l'API Clipboard moderne (préférée)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(productUrl);
        setIsCopied(true);
        success('Lien copié !', 'Succès', 2000);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Méthode 2 : Fallback pour les navigateurs plus anciens ou contextes non sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = productUrl;
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
    const productUrl = `${window.location.origin}/${boutiqueSlug}/produit/${productId}`;
    const message = `Découvrez ${product.nom} sur ${boutiqueData.nom} : ${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Container des toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <FloatingAddToCartButton
        productName={product.nom}
        price={product.prix}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        disabled={!product.en_stock}
        loading={isAddingToCart || panierLoading}
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
              <div
                className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group cursor-zoom-in"
                onClick={() => openFullscreen(selectedImageIndex)}
              >
                <Image
                  src={productImages[selectedImageIndex]}
                  alt={product.nom}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                {/* Icône de zoom */}
                <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Miniatures */}
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
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
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 flex-1">{product.nom}</h1>
                  
                  {/* Boutons de partage */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleShareWhatsApp}
                      className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      title="Partager sur WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                      title="Copier le lien"
                    >
                      {isCopied ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prix dynamique */}
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(getDisplayPrice())}
                  </span>
                  {getOriginalPrice() && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(getOriginalPrice())}
                    </span>
                  )}
                  {(product.est_en_promotion || getSelectedVariant()?.prix_promo) && (
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

              {/* Variants - Nouveau format */}
              {product.variants && typeof product.variants === 'object' && 'variants' in product.variants && Array.isArray(product.variants.variants) && product.variants.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Variantes</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants.variants.map((variant: any, idx: number) => {
                      const isSelected = selectedVariants['variant'] === variant.nom;
                      const isAvailable = variant.quantite > 0;

                      return (
                        <button
                          key={idx}
                          onClick={() => isAvailable && handleVariantChange('variant', variant.nom)}
                          disabled={!isAvailable}
                          className={`p-3 border-2 rounded-lg transition-all duration-200 ${isSelected
                            ? 'border-primary bg-primary text-white'
                            : isAvailable
                              ? 'border-gray-300 bg-white text-gray-700 hover:border-primary'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">{variant.nom}</div>
                            {(variant.prix || variant.prix_promo) && (
                              <div className="mt-1">
                                {variant.prix_promo ? (
                                  // Afficher prix promo + prix normal barré
                                  <div className="space-y-0.5">
                                    <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-primary'}`}>
                                      {formatPrice(variant.prix_promo)}
                                    </div>
                                    {variant.prix && (
                                      <div className={`text-xs line-through ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                        {formatPrice(variant.prix)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // Afficher prix normal uniquement
                                  <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                    {formatPrice(variant.prix)}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : isAvailable ? 'text-gray-500' : 'text-gray-400'}`}>
                              {isAvailable ? `${variant.quantite} disp.` : 'Épuisé'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options de personnalisation */}
              {product.variants && typeof product.variants === 'object' && 'options' in product.variants && Array.isArray(product.variants.options) && product.variants.options.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Options de personnalisation</h3>
                  <div className="space-y-4">
                    {product.variants.options.map((option: any, idx: number) => (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {option.nom}
                          {option.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {option.type === 'texte' ? (
                          <input
                            type="text"
                            placeholder={`Entrez ${option.nom.toLowerCase()}`}
                            value={selectedOptions[option.nom] || ''}
                            onChange={(e) => setSelectedOptions(prev => ({ ...prev, [option.nom]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required={option.required}
                          />
                        ) : (
                          <input
                            type="number"
                            placeholder={`Entrez ${option.nom.toLowerCase()}`}
                            value={selectedOptions[option.nom] || ''}
                            onChange={(e) => setSelectedOptions(prev => ({ ...prev, [option.nom]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required={option.required}
                            min="0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    disabled={!canIncreaseQuantity()}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Statut de stock */}
              <div className="flex items-center justify-between">
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
                {product.en_stock && (
                  <span className="text-sm text-gray-600">
                    {product.quantite_stock} unité{product.quantite_stock > 1 ? 's' : ''} disponible{product.quantite_stock > 1 ? 's' : ''}
                  </span>
                )}
              </div>


              {/* Boutons d'action */}
              <div className="space-y-3 pt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.en_stock || isAddingToCart || panierLoading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg lg:block hidden hover:bg-primary/90 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {(isAddingToCart || panierLoading) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <span>{product.en_stock ? 'Ajouter au panier' : 'Produit indisponible'}</span>
                  )}
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

      {/* Modal Fullscreen pour les images */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Bouton de fermeture */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Compteur d'images */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
            {fullscreenImageIndex + 1} / {productImages.length}
          </div>

          {/* Bouton précédent */}
          {productImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFullscreen('prev');
              }}
              className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full"
              aria-label="Image précédente"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image fullscreen */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={productImages[fullscreenImageIndex]}
              alt={`${product.nom} - Image ${fullscreenImageIndex + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>

          {/* Bouton suivant */}
          {productImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFullscreen('next');
              }}
              className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors p-3 bg-black bg-opacity-50 rounded-full"
              aria-label="Image suivante"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Miniatures en bas */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2 overflow-x-auto max-w-[90vw] px-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${fullscreenImageIndex === index
                    ? 'border-white scale-110'
                    : 'border-transparent hover:border-gray-400 opacity-60 hover:opacity-100'
                    }`}
                >
                  <Image
                    src={image}
                    alt={`Miniature ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
