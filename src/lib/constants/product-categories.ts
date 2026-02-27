/**
 * Types et catégories de produits
 * Chaque catégorie a des champs spécifiques pour simplifier l'ajout
 */

export type ProductCategory = 
  | 'vetements'
  | 'chaussures'
  | 'autres'
  | 'electronique'
  | 'beaute'
  | 'bijoux'
  | 'livres'
  | 'sport'
  | 'services';

export interface ProductCategoryInfo {
  id: ProductCategory;
  nom: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  fields: {
    // Champs de base (tous les produits)
    base: string[];
    // Champs spécifiques à la catégorie
    specific: {
      name: string;
      label: string;
      type: 'text' | 'number' | 'select' | 'multiselect' | 'color' | 'size';
      required: boolean;
      options?: string[];
      placeholder?: string;
    }[];
  };
}

export const PRODUCT_CATEGORIES: Record<ProductCategory, ProductCategoryInfo> = {
  vetements: {
    id: 'vetements',
    nom: 'Vêtements',
    description: 'T-shirts, robes, pantalons, etc.',
    icon: '👕',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'tailles',
          label: 'Tailles disponibles',
          type: 'multiselect',
          required: true,
          options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        },
        {
          name: 'couleurs',
          label: 'Couleurs disponibles',
          type: 'multiselect',
          required: true,
          options: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Marron']
        },
        {
          name: 'matiere',
          label: 'Matière',
          type: 'select',
          required: false,
          options: ['Coton', 'Polyester', 'Soie', 'Lin', 'Laine', 'Denim']
        },
        {
          name: 'genre',
          label: 'Genre',
          type: 'select',
          required: true,
          options: ['Homme', 'Femme', 'Unisexe', 'Enfant']
        }
      ]
    }
  },

  chaussures: {
    id: 'chaussures',
    nom: 'Chaussures',
    description: 'Baskets, sandales, bottes, etc.',
    icon: '👟',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'pointures',
          label: 'Pointures disponibles',
          type: 'multiselect',
          required: true,
          options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
        },
        {
          name: 'couleurs',
          label: 'Couleurs disponibles',
          type: 'multiselect',
          required: true,
          options: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Rouge', 'Vert', 'Marron', 'Beige']
        },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: ['Baskets', 'Sandales', 'Bottes', 'Escarpins', 'Mocassins', 'Tongs']
        },
        {
          name: 'genre',
          label: 'Genre',
          type: 'select',
          required: true,
          options: ['Homme', 'Femme', 'Unisexe', 'Enfant']
        }
      ]
    }
  },

  autres: {
    id: 'autres',
    nom: 'Autres',
    description: 'Produits avec attributs personnalisables',
    icon: '📦',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: []
    }
  },

  electronique: {
    id: 'electronique',
    nom: 'Électronique',
    description: 'Téléphones, ordinateurs, accessoires',
    icon: '📱',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'marque',
          label: 'Marque',
          type: 'text',
          required: true,
          placeholder: 'Ex: Samsung, Apple, HP...'
        },
        {
          name: 'modele',
          label: 'Modèle',
          type: 'text',
          required: true,
          placeholder: 'Ex: iPhone 15 Pro, Galaxy S24...'
        },
        {
          name: 'etat',
          label: 'État',
          type: 'select',
          required: true,
          options: ['Neuf', 'Occasion - Comme neuf', 'Occasion - Bon état', 'Occasion - État correct']
        },
        {
          name: 'garantie',
          label: 'Garantie',
          type: 'select',
          required: false,
          options: ['Aucune', '3 mois', '6 mois', '1 an', '2 ans']
        },
        {
          name: 'couleurs',
          label: 'Couleurs disponibles',
          type: 'multiselect',
          required: false,
          options: ['Noir', 'Blanc', 'Gris', 'Bleu', 'Or', 'Argent']
        }
      ]
    }
  },

  beaute: {
    id: 'beaute',
    nom: 'Beauté & Cosmétiques',
    description: 'Maquillage, parfums, soins',
    icon: '💄',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'marque',
          label: 'Marque',
          type: 'text',
          required: false,
          placeholder: 'Ex: L\'Oréal, Maybelline...'
        },
        {
          name: 'type',
          label: 'Type de produit',
          type: 'select',
          required: true,
          options: ['Maquillage', 'Parfum', 'Soins visage', 'Soins corps', 'Soins cheveux', 'Vernis à ongles']
        },
        {
          name: 'contenance',
          label: 'Contenance',
          type: 'text',
          required: false,
          placeholder: 'Ex: 50ml, 100g...'
        },
        {
          name: 'teinte',
          label: 'Teinte/Couleur',
          type: 'text',
          required: false,
          placeholder: 'Ex: Beige naturel, Rouge passion...'
        }
      ]
    }
  },

  bijoux: {
    id: 'bijoux',
    nom: 'Bijoux & Accessoires',
    description: 'Colliers, boucles, montres',
    icon: '💍',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'type',
          label: 'Type de bijou',
          type: 'select',
          required: true,
          options: ['Collier', 'Bracelet', 'Boucles d\'oreilles', 'Bague', 'Montre', 'Broche']
        },
        {
          name: 'materiau',
          label: 'Matériau',
          type: 'select',
          required: true,
          options: ['Or', 'Argent', 'Acier inoxydable', 'Plaqué or', 'Fantaisie']
        },
        {
          name: 'couleur',
          label: 'Couleur',
          type: 'text',
          required: false,
          placeholder: 'Ex: Doré, Argenté, Or rose...'
        },
        {
          name: 'taille',
          label: 'Taille',
          type: 'text',
          required: false,
          placeholder: 'Ex: Réglable, 50cm, Taille 54...'
        }
      ]
    }
  },

  livres: {
    id: 'livres',
    nom: 'Livres & Médias',
    description: 'Livres, magazines, musique',
    icon: '📚',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'auteur',
          label: 'Auteur',
          type: 'text',
          required: false,
          placeholder: 'Nom de l\'auteur'
        },
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: ['Roman', 'BD/Manga', 'Magazine', 'Livre scolaire', 'DVD/CD', 'Autre']
        },
        {
          name: 'etat',
          label: 'État',
          type: 'select',
          required: true,
          options: ['Neuf', 'Comme neuf', 'Bon état', 'État correct']
        },
        {
          name: 'langue',
          label: 'Langue',
          type: 'select',
          required: false,
          options: ['Français', 'Anglais', 'Espagnol', 'Autre']
        }
      ]
    }
  },

  sport: {
    id: 'sport',
    nom: 'Sport & Loisirs',
    description: 'Équipements sportifs et loisirs',
    icon: '⚽',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'type',
          label: 'Type',
          type: 'select',
          required: true,
          options: ['Vêtement de sport', 'Équipement', 'Accessoire', 'Chaussures de sport']
        },
        {
          name: 'sport',
          label: 'Sport',
          type: 'select',
          required: false,
          options: ['Football', 'Basketball', 'Running', 'Fitness', 'Natation', 'Tennis', 'Autre']
        },
        {
          name: 'taille',
          label: 'Taille',
          type: 'text',
          required: false,
          placeholder: 'Ex: S, M, L, XL ou dimensions'
        },
        {
          name: 'etat',
          label: 'État',
          type: 'select',
          required: true,
          options: ['Neuf', 'Comme neuf', 'Bon état']
        }
      ]
    }
  },

  services: {
    id: 'services',
    nom: 'Services',
    description: 'Services et prestations',
    icon: '🔧',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    fields: {
      base: ['nom', 'prix', 'description', 'images'],
      specific: [
        {
          name: 'type',
          label: 'Type de service',
          type: 'select',
          required: true,
          options: ['Réparation', 'Entretien', 'Installation', 'Formation', 'Consultation', 'Autre']
        },
        {
          name: 'duree',
          label: 'Durée',
          type: 'text',
          required: false,
          placeholder: 'Ex: 1h, 2h, 1 journée...'
        },
        {
          name: 'deplacement',
          label: 'Déplacement',
          type: 'select',
          required: false,
          options: ['À domicile', 'En boutique', 'Les deux']
        }
      ]
    }
  }
};

export function getCategoryInfo(categoryId: ProductCategory): ProductCategoryInfo {
  return PRODUCT_CATEGORIES[categoryId];
}

export function getAllCategories(): ProductCategoryInfo[] {
  return Object.values(PRODUCT_CATEGORIES);
}
