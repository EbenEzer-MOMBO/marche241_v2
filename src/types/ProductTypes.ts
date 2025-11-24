/**
 * Types pour la gestion des produits dans le modal d'administration
 */

/**
 * Variante de produit
 * Chaque variante représente une déclinaison du produit avec son propre stock, prix et image
 */
export interface ProductVariant {
    nom: string;           // Nom de la variante (ex: "Rouge", "Bleu", "Taille M")
    quantite: number;      // Stock disponible pour cette variante
    prix?: number;         // Prix spécifique pour cette variante (optionnel, sinon utilise le prix du produit)
    prix_promo?: number;   // Prix promo spécifique pour cette variante (optionnel)
    image?: string;        // URL de l'image pour cette variante (optionnel)
}

/**
 * Option de personnalisation du produit
 * Permet au client de personnaliser le produit (ex: message personnalisé, numéro)
 */
export interface ProductOption {
    nom: string;                    // Nom de l'option (ex: "Message personnalisé")
    type: 'texte' | 'numero';      // Type de l'option
    required?: boolean;             // Si l'option est obligatoire (par défaut: false)
}

/**
 * Données du formulaire de produit
 */
export interface ProductFormData {
    // Informations de base
    nom: string;
    description: string;
    categorie_id: string;

    // Images
    images: string[];

    // Tarification
    prix: string;
    prix_promo: string;
    en_stock: number;  // Stock total calculé automatiquement

    // Statut
    statut: 'actif' | 'inactif' | 'brouillon';

    // Variantes et options (JSON combiné)
    variants: ProductVariant[];
    options: ProductOption[];
}

/**
 * Props pour le composant ImagesSection
 */
export interface ImagesSectionProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    boutiqueSlug: string;
    isUploading: boolean;
    onUploadStateChange: (isUploading: boolean) => void;
}

/**
 * Props pour le composant VariantsSection
 */
export interface VariantsSectionProps {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
    boutiqueSlug: string;
}

/**
 * Props pour le composant OptionsSection
 */
export interface OptionsSectionProps {
    options: ProductOption[];
    onOptionsChange: (options: ProductOption[]) => void;
}
