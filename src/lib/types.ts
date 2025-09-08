// Types pour les produits et données de l'application

// Interface principale pour un produit
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[]; // Tableau d'images pour la galerie
  image?: string; // Image principale (pour compatibilité)
  description: string;
  category: string;
  variants: ProductVariant[];
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isSale?: boolean;
  sku?: string; // Code produit
  weight?: number; // Poids en grammes
  dimensions?: ProductDimensions;
  tags?: string[]; // Tags pour la recherche
  createdAt?: Date;
  updatedAt?: Date;
  boutique?: string; // Boutique propriétaire
}

// Interface pour les variantes de produit (couleur, taille, etc.)
export interface ProductVariant {
  label: string; // Ex: "Couleur", "Taille", "Initial"
  options: string[]; // Ex: ["Rouge", "Bleu", "Vert"]
  required?: boolean; // Si la sélection est obligatoire
}

// Interface pour les dimensions du produit
export interface ProductDimensions {
  length: number; // Longueur en cm
  width: number; // Largeur en cm
  height: number; // Hauteur en cm
}

// Interface pour un produit dans le panier
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  variant?: string; // Variante sélectionnée (ex: "Rouge - L")
  selectedVariants?: { [key: string]: string }; // Variantes détaillées
}

// Interface pour les produits recommandés (version simplifiée)
export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

// Interface pour les catégories de produits
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string; // Pour les sous-catégories
  products?: Product[];
}

// Interface pour les sections de catégories (utilisée dans TrendingByCategory)
export interface CategorySection {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

// Types pour les filtres de produits
export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
  boutique?: string;
}

// Interface pour les résultats de recherche
export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
}

// Types pour les statuts de stock
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

// Interface pour la gestion du stock
export interface ProductStock {
  productId: string;
  quantity: number;
  status: StockStatus;
  reservedQuantity?: number;
  lastUpdated: Date;
}

// Interface pour les avis produits
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  verified?: boolean; // Achat vérifié
}

// Interface pour les statistiques produit
export interface ProductStats {
  productId: string;
  views: number;
  purchases: number;
  addToCart: number;
  averageRating: number;
  totalReviews: number;
}

// Types d'export pour faciliter l'utilisation
export type ProductList = Product[];
export type CartItems = CartItem[];
export type ProductCategories = ProductCategory[];