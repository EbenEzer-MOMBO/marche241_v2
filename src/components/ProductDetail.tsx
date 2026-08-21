'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import FloatingAddToCartButton from './FloatingAddToCartButton';
import { ProduitDetail, ProduitAffichage, Boutique } from '@/lib/database-types';
import { formatApiProduitPourDetail, formatVariantsPourInterface, getProduitImageUrl } from '@/lib/services/produits';
import { useAjoutPanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import {
  ClothingProductDisplay,
  ShoesProductDisplay,
  GenericProductDisplay,
  EventProductDisplay,
  ServiceProductDisplay,
  ProductPersonnalisationsFields,
  ProductGallery,
  ProductDetailsAccordion,
  RelatedProducts,
} from '@/components/products';
import { BoutiqueTrustSignals } from '@/components/storefront/BoutiqueTrustSignals';
import { formatPromoBadge } from '@/lib/utils/shop-theme';
import { ShopCtaButton } from '@/components/storefront/ShopCtaButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { getProductSalesKind } from '@/lib/utils/product-sales-kind';
import type { PersonnalisationEtatFormulaire, PersonnalisationProduitDef } from '@/lib/types/personnalisations';
import {
  collectPersonnalisationsValidationErrors,
  composePersonnalisationSelectionsPourPanier,
  createInitialPersonnalisationsEtat,
  getSupplementDepuisEtatEtDefinitions,
} from '@/lib/types/personnalisations';

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
  const router = useRouter();
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
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedTaille, setSelectedTaille] = useState<string>('');

  // Référence pour la galerie d'images
  const imageGalleryRef = useRef<HTMLDivElement>(null);

  // Hook pour l'ajout au panier
  const { ajouterProduit, loading: panierLoading, error: panierError } = useAjoutPanier();

  // Hook pour les toasts
  const { toasts, removeToast, success, error: showError } = useToast();

  // Déterminer le type de produit basé sur la catégorie ou le type dans variants
  const getProductType = (): 'vetements' | 'chaussures' | 'generic' | 'evenement' | 'service' => {
    const salesKind = getProductSalesKind({
      variants: product?.variants,
      categorie: product?.categorie,
    });
    if (salesKind === 'evenement') return 'evenement';
    if (salesKind === 'service') return 'service';

    // Vérifier d'abord si le type est explicitement défini dans variants
    if (product?.variants && typeof product.variants === 'object' && 'type' in product.variants) {
      const type = product.variants.type;
      if (type === 'vetements') return 'vetements';
      if (type === 'chaussures') return 'chaussures';
      if (type === 'autres') return 'generic';
    }

    // Sinon, déduire du nom de la catégorie
    const categoryName = product?.categorie?.nom?.toLowerCase() || '';
    if (categoryName.includes('vêtement') || categoryName.includes('vetement') || categoryName.includes('mode')) {
      return 'vetements';
    }
    if (categoryName.includes('chaussure') || categoryName.includes('shoe')) {
      return 'chaussures';
    }

    return 'generic';
  };

  const productType = getProductType();

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
            // Sélectionner le premier variant par défaut (utiliser l'ID)
            initialVariants['variant'] = variantsList[0].id;
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

  const personnalisationDefsSignature =
    product?.variants &&
    typeof product.variants === 'object' &&
    Array.isArray((product.variants as { personnalisations?: PersonnalisationProduitDef[] }).personnalisations)
      ? (product.variants as { personnalisations: PersonnalisationProduitDef[] }).personnalisations
          .map((definition) => `${definition.id}:${definition.obligatoire ? '1' : '0'}`)
          .join('|')
      : '';

  const personnalisationDefinitions = useMemo((): PersonnalisationProduitDef[] => {
    if (!product?.variants || typeof product.variants !== 'object') {
      return [];
    }
    const raw = (product.variants as { personnalisations?: PersonnalisationProduitDef[] }).personnalisations;
    return Array.isArray(raw) ? raw : [];
  }, [product?.id, personnalisationDefsSignature]);

  const [personnalisationsEtat, setPersonnalisationsEtat] =
    useState<Record<string, PersonnalisationEtatFormulaire>>({});

  const [personnalisationFieldErrors, setPersonnalisationFieldErrors] =
    useState<Record<string, string> | undefined>();

  useEffect(() => {
    if (!product?.variants || typeof product.variants !== 'object') {
      setPersonnalisationsEtat({});
      return;
    }
    const raw = (product.variants as { personnalisations?: PersonnalisationProduitDef[] }).personnalisations;
    const defs = Array.isArray(raw) ? raw : [];
    setPersonnalisationsEtat(createInitialPersonnalisationsEtat(defs));
    setPersonnalisationFieldErrors(undefined);
  }, [product?.id, personnalisationDefsSignature]);

  const supplementPersonnalisationsParUnite = product
    ? getSupplementDepuisEtatEtDefinitions(personnalisationDefinitions, personnalisationsEtat)
    : 0;

  const handlePersonnalisationToggle = useCallback((id: string, nextActive: boolean) => {
    setPersonnalisationFieldErrors((prev) => {
      if (!prev?.[id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return Object.keys(next).length > 0 ? next : undefined;
    });
    setPersonnalisationsEtat((prev) => ({
      ...prev,
      [id]: {
        active: nextActive,
        value: nextActive ? (prev[id]?.value ?? '') : '',
      },
    }));
  }, []);

  const handlePersonnalisationValueChange = useCallback(
    (id: string, value: string) => {
      setPersonnalisationFieldErrors((prev) => {
        if (!prev?.[id]) {
          return prev;
        }
        const next = { ...prev };
        delete next[id];
        return Object.keys(next).length > 0 ? next : undefined;
      });
      setPersonnalisationsEtat((prev) => {
        const definition = personnalisationDefinitions.find((d) => d.id === id);
        const fallbackActive = definition?.obligatoire ?? false;
        const row = prev[id];
        return {
          ...prev,
          [id]: {
            active: row?.active ?? fallbackActive,
            value,
          },
        };
      });
    },
    [personnalisationDefinitions]
  );

  // État de chargement avec skeleton loader élégant [[memory:8540418]]
  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-40 lg:pb-0">
        <div className="border-b border-[#ececea] px-4 py-3.5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-3" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-3" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_470px] lg:gap-9">
            <div className="flex gap-3.5">
              <div className="hidden w-[72px] flex-none flex-col gap-2.5 sm:flex">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-7 w-4/5 sm:h-8" />
                <div className="mt-2.5 flex items-baseline gap-2.5">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="mt-3.5 border-y border-[#f0efec] py-3.5">
                  <div className="hidden gap-x-6 sm:flex">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 sm:hidden">
                    <Skeleton className="h-7 w-24 rounded-[7px]" />
                    <Skeleton className="h-7 w-28 rounded-[7px]" />
                    <Skeleton className="h-7 w-20 rounded-[7px]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-9 w-16 rounded-full" />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-20 rounded-full" />
                ))}
              </div>
              <Skeleton className="hidden h-12 w-full rounded-[10px] lg:block" />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ececea] bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-2.5">
            <Skeleton className="h-12 w-[88px] rounded-[10px]" />
            <Skeleton className="h-12 flex-1 rounded-[10px]" />
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
    const allImages: string[] = [];
    
    // 1. Ajouter l'image principale
    if (product.image_principale) {
      allImages.push(getProduitImageUrl(product.image_principale));
    }
    
    // 2. Ajouter toutes les images du tableau images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        const imageUrl = getProduitImageUrl(img);
        // Éviter les doublons avec l'image principale
        if (!allImages.includes(imageUrl)) {
          allImages.push(imageUrl);
        }
      });
    }
    
    // 3. Ajouter les images des variants
    if (product.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      product.variants.variants
        .filter((v: any) => v.image)
        .forEach((v: any) => {
          const variantImageUrl = getProduitImageUrl(v.image);
          // Éviter les doublons
          if (!allImages.includes(variantImageUrl)) {
            allImages.push(variantImageUrl);
          }
        });
    }
    
    // Si aucune image n'a été trouvée, utiliser l'image principale comme fallback
    if (allImages.length === 0 && product.image_principale) {
      allImages.push(getProduitImageUrl(product.image_principale));
    }
    
    return allImages;
  };

  const productImages = prepareProductImages();

  // Obtenir le variant sélectionné
  const getSelectedVariant = () => {
    if (product?.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      const selectedVariantId = selectedVariants['variant'];
      if (selectedVariantId) {
        return product.variants.variants.find((v: any) => v.id === selectedVariantId);
      }
      return product.variants.variants[0]; // Premier variant par défaut
    }
    return null;
  };

  // Formater le nom d'un variant à partir de ses attributs ou propriétés
  const getVariantDisplayName = (variant: any) => {
    // Pour les produits génériques avec attributs
    if (variant.attributes && Array.isArray(variant.attributes)) {
      return variant.attributes.map((attr: any) => attr.value).join(' - ');
    }
    
    // Pour les produits vêtements
    if (variant.couleur && selectedTaille) {
      return `${variant.couleur} - Taille ${selectedTaille}`;
    }
    
    // Pour les produits chaussures
    if (variant.couleur && selectedTaille && productType === 'chaussures') {
      return `${variant.couleur} - Pointure ${selectedTaille}`;
    }
    
    // Pour les vêtements/chaussures sans taille sélectionnée
    if (variant.couleur) {
      return variant.couleur;
    }
    
    return variant.nom || 'Variant';
  };

  // Obtenir l'image du variant sélectionné ou l'image principale du produit
  const getDisplayImage = () => {
    const selectedVariant = getSelectedVariant();
    
    // Si variant avec image, utiliser celle-ci
    if (selectedVariant && selectedVariant.image) {
      return getProduitImageUrl(selectedVariant.image);
    }
    
    // Sinon, utiliser l'image principale du produit
    return getProduitImageUrl(product.image_principale);
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

  const handleVariantChange = (variantLabel: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantLabel]: variantId
    }));

    // Sélectionner l'image du variant si elle existe (sans défilement)
    if (product?.variants && typeof product.variants === 'object' && 'variants' in product.variants) {
      const variant = product.variants.variants.find((v: any) => v.id === variantId);
      if (variant && variant.image) {
        const variantImageUrl = getProduitImageUrl(variant.image);
        const imageIndex = productImages.indexOf(variantImageUrl);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  // Gestionnaire de changement de variant pour les composants spécialisés
  const handleSpecializedVariantChange = (variantId: string, taille?: string) => {
    setSelectedVariantId(variantId);
    if (taille) {
      setSelectedTaille(taille);
    }
    handleVariantChange('variant', variantId);
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
        const selectedVariantId = selectedVariants['variant'];

        if (selectedVariantId) {
          // Trouver le variant sélectionné par ID
          const selectedVariant = variantsList.find(v => v.id === selectedVariantId);
          if (selectedVariant && selectedVariant.stock !== undefined) {
            return selectedVariant.stock;
          }
          if (selectedVariant && selectedVariant.quantite !== undefined) {
            return selectedVariant.quantite;
          }
        }

        // Par défaut, retourner la quantité du premier variant
        if (variantsList.length > 0) {
          return variantsList[0].stock || variantsList[0].quantite || 1;
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

  const handleAddToCart = async (options?: { buyNow?: boolean }) => {
    if (!product) return;
    const buyNow = options?.buyNow === true;

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

      const persValidation = collectPersonnalisationsValidationErrors(
        personnalisationDefinitions,
        personnalisationsEtat
      );
      if (persValidation) {
        setPersonnalisationFieldErrors(persValidation);
        const firstErr = Object.values(persValidation)[0];
        if (firstErr) {
          showError(firstErr, 'Erreur', 5000);
        }
        setIsAddingToCart(false);
        return;
      }

      setPersonnalisationFieldErrors(undefined);

      // Obtenir le variant sélectionné avec toutes ses données
      const selectedVariant = getSelectedVariant();

      // Préparer les données pour le panier
      const cartData: any = {};

      // Ajouter les données du variant si présent
      if (selectedVariant) {
        const variantName = getVariantDisplayName(selectedVariant);
        cartData.variant = {
          id: selectedVariant.id,
          nom: variantName,
          prix: selectedVariant.prix_promo || selectedVariant.prix,
          prix_original: selectedVariant.prix_promo ? selectedVariant.prix : null,
          image: selectedVariant.image,
          attributes: selectedVariant.attributes
        };
      }

      // Ajouter les options si présentes
      if (Object.keys(selectedOptions).length > 0) {
        cartData.options = selectedOptions;
      }

      const persSelections = composePersonnalisationSelectionsPourPanier(
        personnalisationDefinitions,
        personnalisationsEtat
      );
      if (persSelections.length > 0) {
        cartData.personnalisations = persSelections;
      }

      // Construire le message
      let message = `${product.nom} ajouté au panier`;
      if (selectedVariant) {
        const variantName = getVariantDisplayName(selectedVariant);
        message = `${product.nom} (${variantName}) ajouté au panier`;
      }

      const isSuccess = await ajouterProduit(
        product.boutique.id,
        product.id,
        quantity,
        cartData
      );

      if (isSuccess) {
        if (buyNow) {
          router.push(`/${boutiqueSlug}/commande?direct=1`);
          return;
        }
        success(message, 'Succès', 4000);
        // Réinitialiser les options après ajout
        setSelectedOptions({});
        setPersonnalisationsEtat(createInitialPersonnalisationsEtat(personnalisationDefinitions));
        setPersonnalisationFieldErrors(undefined);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    void handleAddToCart({ buyNow: true });
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

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/${boutiqueSlug}/produit/${productId}`;
    const shareData = {
      title: product.nom,
      text: `Découvrez ${product.nom} sur ${boutiqueData.nom}`,
      url: productUrl,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await handleCopyLink();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      await handleCopyLink();
    }
  };

  const isEvent = productType === 'evenement';
  const isService = productType === 'service';

  const trustItems = isEvent
    ? [
        {
          title: 'Livraison immédiate',
          subtitle: 'par message après paiement',
        },
        {
          title: 'Moov · Airtel · Visa',
          subtitle: 'paiement en ligne',
        },
        {
          title: boutiqueData.nom,
          subtitle: boutiqueData.ville || 'Libreville',
        },
      ]
    : [
        {
          title: 'Livraison 24–48 h',
          subtitle: boutiqueData.adresse || 'Libreville et environs',
        },
        {
          title: 'Moov · Airtel · Visa',
          subtitle: 'ou paiement à la livraison',
        },
        {
          title: boutiqueData.nom,
          subtitle: boutiqueData.ville || 'Libreville',
        },
      ];

  const shippingLines = isEvent
    ? [
        'Livraison immédiate par message après paiement.',
        'Aucun envoi postal : le billet est transmis dès confirmation.',
        ...(product.variants && typeof product.variants === 'object' && (product.variants as { meta?: { non_remboursable?: boolean } }).meta?.non_remboursable !== false
          ? ['Billet non remboursable.']
          : []),
      ]
    : [
        `Livraison 24–48 h à ${boutiqueData.ville || 'Libreville'} et environs.`,
        'Paiement Moov Money, Airtel Money, Visa ou à la livraison.',
        'Échange ou remboursement sous 48 h en cas de produit non conforme.',
      ];

  const stockLabel = product.en_stock
    ? product.quantite_stock > 0
      ? `En stock · ${product.quantite_stock} unité${product.quantite_stock > 1 ? 's' : ''}`
      : 'En stock'
    : 'Rupture de stock';

  const promoBadge = formatPromoBadge(
    getDisplayPrice(),
    getOriginalPrice() || undefined
  );

  const galleryAspect = isEvent || isService ? 'poster' : 'square';

  const stickyPrimaryLabel = isEvent
    ? 'Réserver'
    : isService
      ? (product.variants as { meta?: { sur_devis?: boolean } })?.meta?.sur_devis
        ? 'Devis'
        : 'Réserver'
      : 'Acheter';

  return (
    <>
      {/* Container des toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <FloatingAddToCartButton
          productName={product.nom}
          productImage={getDisplayImage()}
          price={getDisplayPrice()}
          supplementPerUnit={supplementPersonnalisationsParUnite}
          quantity={quantity}
          onQuantityChange={setQuantity}
          canDecrease={quantity > 1}
          canIncrease={canIncreaseQuantity()}
          onAddToCart={() => void handleAddToCart()}
          onBuyNow={handleBuyNow}
          disabled={!product.en_stock}
          loading={isAddingToCart || panierLoading}
          primaryLabel={stickyPrimaryLabel}
          hideSecondary={isEvent}
        />

      <div className="min-h-screen bg-white pb-40 lg:pb-0">
        {/* Fil d'Ariane */}
        <div className="border-b border-[#ececea] px-4 py-3.5 sm:px-8">
          <nav
            className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-hidden whitespace-nowrap font-mono text-[13px] text-[#8b8f95]"
            aria-label="Fil d'Ariane"
          >
            <Link
              href={boutiqueSlug ? `/${boutiqueSlug}` : '/'}
              className="hover:text-[#17181a]"
            >
              Accueil
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={
                boutiqueSlug
                  ? `/${boutiqueSlug}/produits?categorie=${product.categorie.slug}`
                  : `/produits?categorie=${product.categorie.slug}`
              }
              className="hover:text-[#17181a]"
            >
              {product.categorie.nom}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-[#17181a]">{product.nom}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_470px] lg:gap-9">
            {/* Galerie d'images */}
            <div ref={imageGalleryRef}>
              <ProductGallery
                images={productImages}
                productName={product.nom}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
                onOpenFullscreen={openFullscreen}
                aspect={galleryAspect}
              />
            </div>

            {/* Informations du produit */}
            <div className="space-y-5">
              {/* En-tête */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-mono text-[12.5px] uppercase tracking-[0.08em] text-[#8b8f95]">
                    {product.categorie.nom}
                  </p>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      className="text-[12.5px] font-medium text-[#5f6369] hover:text-[#17181a] focus:outline-none focus-visible:underline"
                      aria-label="Partager le produit"
                    >
                      Partager
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="text-[12.5px] font-medium text-[#5f6369] hover:text-[#17181a] focus:outline-none focus-visible:underline"
                      aria-label="Copier le lien du produit"
                    >
                      {isCopied ? 'Lien copié' : 'Copier le lien'}
                    </button>
                  </div>
                </div>

                <h1 className="text-[21px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#17181a] sm:text-[27px] sm:leading-[1.2]">
                  {product.nom}
                </h1>

                {/* Prix unique + état du stock */}
                <div className="mt-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="hidden font-mono text-[22px] font-semibold text-[#17181a] lg:inline sm:text-[27px]">
                      {formatPrice(getDisplayPrice() + supplementPersonnalisationsParUnite)}
                    </span>
                    {getOriginalPrice() && (
                      <span className="hidden font-mono text-[13px] text-[#9a9892] line-through lg:inline">
                        {formatPrice(getOriginalPrice())}
                      </span>
                    )}
                    {promoBadge && (
                      <span className="hidden rounded-[5px] bg-[#17181a] px-1.5 py-0.5 font-mono text-[11px] font-medium text-white lg:inline">
                        {promoBadge}
                      </span>
                    )}
                    <span
                      className={`font-mono text-[12.5px] font-medium ${
                        product.en_stock ? 'text-[#16a34a]' : 'text-[#b3261e]'
                      }`}
                    >
                      {stockLabel}
                    </span>
                  </div>
                  {supplementPersonnalisationsParUnite > 0 ? (
                    <p className="mt-2 hidden text-[12.5px] text-[#8b8f95] lg:block">
                      dont personnalisation : +{formatPrice(supplementPersonnalisationsParUnite)} · prix de base{' '}
                      {formatPrice(getDisplayPrice())}
                    </p>
                  ) : null}
                </div>

                {/* Bandeau réassurance, remonté au-dessus des variantes */}
                <div className="mt-3.5 border-y border-[#f0efec] py-3.5">
                  <BoutiqueTrustSignals items={trustItems} className="hidden sm:flex" />
                  <BoutiqueTrustSignals
                    items={trustItems}
                    variant="pills"
                    className="sm:hidden"
                  />
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

              {/* Variants - Nouveau format avec composants spécialisés */}
              {productType === 'evenement' && (
                <EventProductDisplay
                  product={product}
                  onVariantChange={handleSpecializedVariantChange}
                  onAddToCart={() => void handleAddToCart()}
                  onBuyNow={handleBuyNow}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  isAddingToCart={isAddingToCart || panierLoading}
                  selectedVariantId={selectedVariantId}
                  description={product.description || product.description_courte}
                />
              )}

              {productType === 'service' && (
                <ServiceProductDisplay
                  product={product}
                  boutique={boutiqueData}
                  onAddToCart={() => void handleAddToCart()}
                  onBuyNow={handleBuyNow}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  isAddingToCart={isAddingToCart || panierLoading}
                />
              )}

              {productType !== 'evenement' &&
                productType !== 'service' &&
                product.variants &&
                typeof product.variants === 'object' &&
                'variants' in product.variants &&
                Array.isArray(product.variants.variants) &&
                product.variants.variants.length > 0 && (
                <div>
                  {productType === 'vetements' && (
                    <ClothingProductDisplay
                      product={product}
                      onVariantChange={handleSpecializedVariantChange}
                      onAddToCart={() => void handleAddToCart()}
                      onBuyNow={handleBuyNow}
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      isAddingToCart={isAddingToCart || panierLoading}
                      selectedVariantId={selectedVariantId}
                      selectedTaille={selectedTaille}
                      personnalisationsEtat={personnalisationsEtat}
                      onPersonnalisationToggle={handlePersonnalisationToggle}
                      onPersonnalisationValueChange={handlePersonnalisationValueChange}
                      personnalisationValidationErrors={personnalisationFieldErrors}
                    />
                  )}

                  {productType === 'chaussures' && (
                    <ShoesProductDisplay
                      product={product}
                      onVariantChange={handleSpecializedVariantChange}
                      onAddToCart={() => void handleAddToCart()}
                      onBuyNow={handleBuyNow}
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      isAddingToCart={isAddingToCart || panierLoading}
                      selectedVariantId={selectedVariantId}
                      selectedPointure={selectedTaille}
                      personnalisationsEtat={personnalisationsEtat}
                      onPersonnalisationToggle={handlePersonnalisationToggle}
                      onPersonnalisationValueChange={handlePersonnalisationValueChange}
                      personnalisationValidationErrors={personnalisationFieldErrors}
                    />
                  )}

                  {productType === 'generic' && (
                    <GenericProductDisplay
                      product={product}
                      onVariantChange={handleSpecializedVariantChange}
                      onAddToCart={() => void handleAddToCart()}
                      onBuyNow={handleBuyNow}
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      isAddingToCart={isAddingToCart || panierLoading}
                      selectedVariantId={selectedVariantId}
                      personnalisationsEtat={personnalisationsEtat}
                      onPersonnalisationToggle={handlePersonnalisationToggle}
                      onPersonnalisationValueChange={handlePersonnalisationValueChange}
                      personnalisationValidationErrors={personnalisationFieldErrors}
                    />
                  )}
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

              {/* Personnalisations (produit sans variant à choix) */}
              {(!product.variants ||
                !product.variants.variants ||
                product.variants.variants.length === 0) &&
                personnalisationDefinitions.length > 0 && (
                  <ProductPersonnalisationsFields
                    definitions={personnalisationDefinitions}
                    state={personnalisationsEtat}
                    onToggle={handlePersonnalisationToggle}
                    onValueChange={handlePersonnalisationValueChange}
                    validationErrors={personnalisationFieldErrors}
                  />
                )}

              {/* Quantité - Affichée uniquement pour les produits sans composant spécialisé */}
              {productType !== 'evenement' &&
                productType !== 'service' &&
                (!product.variants || !product.variants.variants || product.variants.variants.length === 0) && (
                <div className="hidden lg:block">
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
              )}

              {/* Boutons d'action - Affichés uniquement pour les produits sans composant spécialisé */}
              {productType !== 'evenement' &&
                productType !== 'service' &&
                (!product.variants || !product.variants.variants || product.variants.variants.length === 0) && (
                <div className="hidden space-y-2.5 pt-6 lg:block">
                  <ShopCtaButton
                    size="lg"
                    disabled={!product.en_stock || isAddingToCart || panierLoading}
                    onClick={handleBuyNow}
                    aria-label="Acheter maintenant"
                  >
                    {(isAddingToCart || panierLoading)
                      ? 'Ajout en cours…'
                      : product.en_stock
                        ? 'Acheter maintenant'
                        : 'Produit indisponible'}
                  </ShopCtaButton>
                  <ShopCtaButton
                    variant="secondary"
                    size="lg"
                    disabled={!product.en_stock || isAddingToCart || panierLoading}
                    onClick={() => void handleAddToCart()}
                    aria-label="Ajouter au panier"
                  >
                    Ajouter au panier
                  </ShopCtaButton>
                  <p className="text-center text-[12.5px] leading-[1.5] text-[#8b8f95]">
                    « Acheter maintenant » vous mène directement au récap commande.
                  </p>
                </div>
              )}

              {/* Détails repliables : description, livraison, contact vendeur */}
              <ProductDetailsAccordion
                description={product.description || product.description_courte}
                shippingTitle={isEvent ? 'Réception du billet' : 'Livraison et retours'}
                shippingLines={shippingLines}
                hideDescription={isEvent}
              />

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

        {/* Sortie de secours : autres articles de la boutique */}
        <RelatedProducts
          boutiqueId={boutiqueData.id}
          boutiqueSlug={boutiqueSlug}
          currentProductId={product.id}
        />
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
              {productImages.map((image: string, index: number) => (
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
