import { Product, ProductCategory, CategorySection } from './types';

// Catégories de produits
export const productCategories: ProductCategory[] = [
  {
    id: 'fashion',
    name: 'Mode',
    description: 'Vêtements et accessoires de mode',
    icon: '👕'
  },
  {
    id: 'electronics',
    name: 'Électronique',
    description: 'Appareils électroniques et gadgets',
    icon: '📱'
  },
  {
    id: 'jewelry',
    name: 'Bijoux',
    description: 'Bijoux et accessoires précieux',
    icon: '💎'
  },
  {
    id: 'home',
    name: 'Maison',
    description: 'Décoration et articles pour la maison',
    icon: '🏠'
  },
  {
    id: 'shoes',
    name: 'Chaussures',
    description: 'Chaussures pour tous les styles',
    icon: '👟'
  },
  {
    id: 'accessories',
    name: 'Accessoires',
    description: 'Sacs, ceintures et autres accessoires',
    icon: '👜'
  }
];

// Données de test pour les produits
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone Elite Pro',
    price: 299999,
    originalPrice: 349999,
    images: ['/article1.webp', '/article2.webp', '/article3.webp'],
    image: '/article1.webp',
    description: 'Smartphone haut de gamme avec écran OLED 6.7 pouces, processeur octa-core et appareil photo 108MP. Parfait pour les professionnels et les passionnés de technologie.',
    category: 'electronics',
    variants: [
      {
        label: 'Couleur',
        options: ['Noir', 'Blanc', 'Bleu', 'Rouge'],
        required: true
      },
      {
        label: 'Stockage',
        options: ['128GB', '256GB', '512GB'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
    isSale: true,
    sku: 'PHONE-001',
    weight: 180,
    dimensions: { length: 15.7, width: 7.6, height: 0.8 },
    tags: ['smartphone', 'android', 'premium', 'photo'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Initial Armandèse',
    price: 12500,
    originalPrice: 15000,
    images: ['/article2.webp', '/article1.webp', '/article3.webp', '/article4.webp'],
    image: '/article2.webp',
    description: 'Magnifique initial personnalisé en acier inoxydable de haute qualité. Parfait pour un cadeau unique et élégant.',
    category: 'jewelry',
    variants: [
      {
        label: 'Initial',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        required: true
      },
      {
        label: 'Couleur',
        options: ['Or', 'Argent', 'Rose Gold'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewCount: 87,
    isNew: true,
    sku: 'JEW-002',
    weight: 15,
    dimensions: { length: 2.5, width: 2.5, height: 0.3 },
    tags: ['bijoux', 'personnalisé', 'cadeau', 'initial'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    name: 'Robe Élégante',
    price: 45000,
    images: ['/article3.webp', '/article2.webp'],
    image: '/article3.webp',
    description: 'Robe élégante en tissu premium, parfaite pour les occasions spéciales. Coupe moderne et confortable.',
    category: 'fashion',
    variants: [
      {
        label: 'Taille',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        required: true
      },
      {
        label: 'Couleur',
        options: ['Noir', 'Bleu Marine', 'Rouge', 'Vert'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.6,
    reviewCount: 56,
    isNew: true,
    sku: 'DRESS-003',
    weight: 300,
    dimensions: { length: 120, width: 50, height: 2 },
    tags: ['robe', 'élégant', 'soirée', 'femme'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '4',
    name: 'Sneakers Comfort',
    price: 75000,
    originalPrice: 85000,
    images: ['/article4.webp', '/article1.webp'],
    image: '/article4.webp',
    description: 'Sneakers ultra-confortables avec semelle en mousse mémoire. Idéales pour le sport et le quotidien.',
    category: 'shoes',
    variants: [
      {
        label: 'Pointure',
        options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
        required: true
      },
      {
        label: 'Couleur',
        options: ['Blanc', 'Noir', 'Gris', 'Bleu'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.7,
    reviewCount: 203,
    isSale: true,
    sku: 'SHOES-004',
    weight: 450,
    dimensions: { length: 30, width: 12, height: 10 },
    tags: ['sneakers', 'sport', 'confort', 'running'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '5',
    name: 'Sac à Main Premium',
    price: 55000,
    images: ['/article5.webp', '/article3.webp'],
    image: '/article5.webp',
    description: 'Sac à main en cuir véritable, design moderne et élégant. Parfait pour le travail et les sorties.',
    category: 'accessories',
    variants: [
      {
        label: 'Couleur',
        options: ['Noir', 'Marron', 'Beige', 'Rouge'],
        required: true
      },
      {
        label: 'Taille',
        options: ['Petit', 'Moyen', 'Grand'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.5,
    reviewCount: 78,
    isNew: true,
    sku: 'BAG-005',
    weight: 600,
    dimensions: { length: 35, width: 15, height: 25 },
    tags: ['sac', 'cuir', 'femme', 'travail'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '6',
    name: 'Lampe Design',
    price: 25000,
    images: ['/article1.webp', '/article4.webp'],
    image: '/article1.webp',
    description: 'Lampe de table au design moderne et épuré. Éclairage LED économique et réglable.',
    category: 'home',
    variants: [
      {
        label: 'Couleur',
        options: ['Blanc', 'Noir', 'Argent'],
        required: true
      },
      {
        label: 'Type d\'éclairage',
        options: ['Blanc chaud', 'Blanc froid', 'RGB'],
        required: true
      }
    ],
    inStock: true,
    rating: 4.4,
    reviewCount: 34,
    sku: 'LAMP-006',
    weight: 800,
    dimensions: { length: 20, width: 20, height: 45 },
    tags: ['lampe', 'design', 'LED', 'maison'],
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-16')
  }
];

// Fonction pour obtenir les produits par boutique
export const getProductsForBoutique = (boutiqueName: string): Product[] => {
  if (boutiqueName === 'boutique_de_joline') {
    return sampleProducts.map(product => ({
      ...product,
      name: product.name + ' - Collection Joline',
      boutique: boutiqueName
    }));
  }

  return sampleProducts.map(product => ({
    ...product,
    boutique: boutiqueName
  }));
};

// Fonction pour obtenir un produit par ID
export const getProductById = (id: string, boutiqueName?: string): Product | undefined => {
  const products = boutiqueName ? getProductsForBoutique(boutiqueName) : sampleProducts;
  return products.find(product => product.id === id);
};

// Fonction pour obtenir les produits par catégorie
export const getProductsByCategory = (categoryId: string, boutiqueName?: string): Product[] => {
  const products = boutiqueName ? getProductsForBoutique(boutiqueName) : sampleProducts;
  return products.filter(product => product.category === categoryId);
};

// Fonction pour obtenir les produits en promotion
export const getSaleProducts = (boutiqueName?: string): Product[] => {
  const products = boutiqueName ? getProductsForBoutique(boutiqueName) : sampleProducts;
  return products.filter(product => product.isSale);
};

// Fonction pour obtenir les nouveaux produits
export const getNewProducts = (boutiqueName?: string): Product[] => {
  const products = boutiqueName ? getProductsForBoutique(boutiqueName) : sampleProducts;
  return products.filter(product => product.isNew);
};

// Sections de catégories pour TrendingByCategory
export const getCategorySections = (boutiqueName?: string): CategorySection[] => {
  const products = boutiqueName ? getProductsForBoutique(boutiqueName) : sampleProducts;
  
  return [
    {
      id: 'fashion',
      name: 'Mode',
      icon: '👕',
      products: products.filter(p => p.category === 'fashion')
    },
    {
      id: 'electronics',
      name: 'Électronique',
      icon: '📱',
      products: products.filter(p => p.category === 'electronics')
    },
    {
      id: 'jewelry',
      name: 'Bijoux',
      icon: '💎',
      products: products.filter(p => p.category === 'jewelry')
    },
    {
      id: 'shoes',
      name: 'Chaussures',
      icon: '👟',
      products: products.filter(p => p.category === 'shoes')
    },
    {
      id: 'accessories',
      name: 'Accessoires',
      icon: '👜',
      products: products.filter(p => p.category === 'accessories')
    },
    {
      id: 'home',
      name: 'Maison',
      icon: '🏠',
      products: products.filter(p => p.category === 'home')
    }
  ].filter(section => section.products.length > 0);
};