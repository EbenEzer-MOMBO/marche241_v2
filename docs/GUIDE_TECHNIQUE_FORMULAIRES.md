# Guide Technique - Formulaires de Produits

## 🏗️ Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│              products/page.tsx (Orchestrateur)          │
│  - Gestion des états (modal, category, productToEdit)  │
│  - Handlers (save, edit, delete)                        │
│  - Formatage des données pour l'API                     │
└────────────┬───────────────────────────────────────────┘
             │
             ├─► CategorySelectionModal
             │   └─► Affiche 3 options : vetements, chaussures, autres
             │
             └─► SimplifiedProductModal (Routeur)
                 │
                 ├─► ClothingProductForm (si category === 'vetements')
                 ├─► ShoesProductForm (si category === 'chaussures')
                 └─► GenericProductForm (si category === 'autres')
```

### Fichiers principaux

```
src/
├── components/admin/products/
│   ├── CategorySelectionModal.tsx      # Sélection du type
│   ├── SimplifiedProductModal.tsx      # Routeur de formulaires
│   ├── ClothingProductForm.tsx         # Formulaire vêtements
│   ├── ShoesProductForm.tsx            # Formulaire chaussures
│   ├── GenericProductForm.tsx          # Formulaire générique
│   └── index.ts                        # Exports
│
├── app/admin/[boutique]/products/
│   └── page.tsx                        # Page principale avec handlers
│
└── lib/
    ├── constants/product-categories.ts # Types et catégories
    ├── services/products.ts            # API produits
    └── services/upload.ts              # API upload images
```

---

## 🔧 Composants en détail

### CategorySelectionModal

**Rôle** : Afficher 3 options simplifiées

```typescript
// src/components/admin/products/CategorySelectionModal.tsx

const SIMPLIFIED_CATEGORIES = [
  {
    id: 'vetements' as ProductCategory,
    nom: 'Vêtements',
    description: 'T-shirts, robes, pantalons, etc.',
    icon: <Shirt className="h-12 w-12" />,
    bgColor: 'bg-purple-50',
    color: 'text-purple-700',
    borderColor: 'hover:border-purple-500'
  },
  // ... chaussures, autres
];

export function CategorySelectionModal({
  isOpen,
  onClose,
  onSelectCategory
}: CategorySelectionModalProps) {
  // Affichage simple des 3 options
  return (
    <div>
      {SIMPLIFIED_CATEGORIES.map(category => (
        <button onClick={() => onSelectCategory(category.id)}>
          {category.nom}
        </button>
      ))}
    </div>
  );
}
```

---

### SimplifiedProductModal (Routeur)

**Rôle** : Router vers le bon formulaire selon la catégorie

```typescript
// src/components/admin/products/SimplifiedProductModal.tsx

export function SimplifiedProductModal({
  category,
  productToEdit,
  // ... autres props
}: SimplifiedProductModalProps) {
  // Clé unique pour forcer le remount lors du changement
  const modalKey = `${category}-${isOpen ? 'open' : 'closed'}-${productToEdit?.id || 'new'}`;

  // Routage conditionnel
  if (category === 'vetements') {
    return <ClothingProductForm key={modalKey} {...props} />;
  }
  
  if (category === 'chaussures') {
    return <ShoesProductForm key={modalKey} {...props} />;
  }
  
  if (category === 'autres') {
    return <GenericProductForm key={modalKey} {...props} />;
  }
  
  // Fallback pour anciennes catégories
  return <div>Formulaire legacy...</div>;
}
```

---

### Formulaires (Structure commune)

Tous les formulaires partagent une structure similaire :

```typescript
// Structure de base d'un formulaire

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: any[];
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any;
}

export function SomeProductForm({ ... }: FormProps) {
  // 1. États
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // 2. Effets
  useEffect(() => {
    // Charger les données d'édition
    if (isOpen && productToEdit) {
      setFormData(productToEdit);
      setUploadedImageUrls(productToEdit.images);
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    // Sauvegarde automatique en brouillon
    if (isOpen && isDirty && !productToEdit) {
      localStorage.setItem('draft_key', JSON.stringify(formData));
    }
  }, [formData, isOpen, isDirty, productToEdit]);

  useEffect(() => {
    // Réinitialisation
    if (!isOpen) {
      resetForm();
    } else if (isOpen && !productToEdit) {
      resetForm();
      preSelectCategory();
    }
  }, [isOpen, productToEdit]);

  // 3. Fonctions de validation
  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (section) {
      case 1: /* Valider infos de base */ break;
      case 2: /* Valider images */ break;
      case 3: /* Valider variants */ break;
      case 4: /* Valider personnalisations */ break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Fonctions de navigation
  const handleNext = async () => {
    if (validateSection(currentSection)) {
      if (currentSection === 2) {
        await uploadImages(); // Upload avant de passer à la section 3
      }
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  // 5. Upload d'images
  const uploadImages = async () => {
    // Vérifier si déjà uploadées (URLs)
    const allImagesAreUrls = formData.images.every(img => 
      img.startsWith('http://') || img.startsWith('https://')
    );
    
    if (allImagesAreUrls) {
      setUploadedImageUrls(formData.images);
      return;
    }

    // Upload via API
    setIsUploadingImages(true);
    try {
      const { uploadImage } = await import('@/lib/services/upload');
      
      const uploadPromises = formData.images.map(async (base64Image) => {
        const blob = await fetch(base64Image).then(r => r.blob());
        const file = new File([blob], `product-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const result = await uploadImage(file, boutiqueSlug, 'produits');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(uploadedUrls);
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    } finally {
      setIsUploadingImages(false);
    }
  };

  // 6. Soumission
  const handleSubmit = () => {
    // Valider toutes les sections
    let allValid = true;
    for (let i = 1; i <= 4; i++) {
      if (!validateSection(i)) {
        allValid = false;
        setCurrentSection(i);
        break;
      }
    }

    if (allValid) {
      const productData = {
        ...formData,
        category: category,
        image_principale: formData.images[0],
        ...(productToEdit?.id && { id: productToEdit.id })
      };
      
      localStorage.removeItem('draft_key');
      onSave(productData);
    }
  };

  // 7. Rendu des sections
  const renderSection1 = () => { /* Infos de base */ };
  const renderSection2 = () => { /* Images */ };
  const renderSection3 = () => { /* Variants (spécifique à chaque formulaire) */ };
  const renderSection4 = () => { /* Personnalisations */ };

  // 8. Rendu principal
  return (
    <div className="modal">
      <header>Navigation 1-2-3-4</header>
      <main>{renderCurrentSection()}</main>
      <footer>
        <button onClick={handlePrevious}>Précédent</button>
        {currentSection < 4 ? (
          <button onClick={handleNext}>Suivant</button>
        ) : (
          <button onClick={handleSubmit}>Enregistrer</button>
        )}
      </footer>
    </div>
  );
}
```

---

## 📊 Interfaces TypeScript

### Types de base

```typescript
// src/lib/constants/product-categories.ts

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
```

### ClothingProductForm

```typescript
// Variant vêtement
interface ClothingVariant {
  id: string;
  image?: string;
  couleur: string;
  tailles: Array<{
    taille: string;    // "S", "M", "L", etc.
    stock: number;
  }>;
  prix: number;
  prix_promo?: number;
}

// FormData complet
interface FormData {
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  images: string[];
  variants: ClothingVariant[];
  personnalisations: Customization[];
}
```

### ShoesProductForm

```typescript
// Variant chaussure
interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{
    pointure: string;  // "40", "41", "42", etc.
    stock: number;
  }>;
  prix: number;
  prix_promo?: number;
}
```

### GenericProductForm

```typescript
// Attribut flexible
interface VariantAttribute {
  type: 'couleur' | 'taille' | 'contenance';
  value: string;
}

// Variant générique
interface GenericVariant {
  id: string;
  image?: string;
  attributes: VariantAttribute[];  // Multiple attributs
  stock: number;                   // Stock unique (pas de subdivision)
  prix: number;
  prix_promo?: number;
}
```

### Personnalisation (commune)

```typescript
interface Customization {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  prix_supplementaire?: number;
  obligatoire: boolean;
}
```

---

## 🔄 Flux de données

### Création d'un produit

```
┌─────────────────┐
│  Utilisateur    │
└────────┬────────┘
         │ Clic "Nouveau"
         ▼
┌─────────────────────────┐
│ CategorySelectionModal  │
└────────┬────────────────┘
         │ Sélection type
         ▼
┌─────────────────────────┐
│ SimplifiedProductModal  │ (routeur)
└────────┬────────────────┘
         │ Route vers
         ▼
┌─────────────────────────┐
│   SomeProductForm       │
│  - Remplissage 4 étapes │
│  - Upload images (S2)   │
│  - Validation (S1-4)    │
└────────┬────────────────┘
         │ handleSubmit()
         ▼
┌─────────────────────────┐
│  onSave(productData)    │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  handleSaveSimplifiedProduct()   │
│  (dans page.tsx)                 │
│                                  │
│  1. Formater les variants        │
│  2. Calculer stock total         │
│  3. Calculer prix principal      │
│  4. Appeler creerProduit(data)   │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│     API Backend         │
│  POST /api/v1/produits  │
└─────────────────────────┘
```

### Édition d'un produit

```
┌─────────────────┐
│  Utilisateur    │
└────────┬────────┘
         │ Clic "Modifier"
         ▼
┌──────────────────────────┐
│  handleEditProduct()     │
│  (dans page.tsx)         │
│                          │
│  1. Détecter type via    │
│     product.variants.type│
│  2. Extraire données     │
│  3. Set productToEdit    │
│  4. Set selectedCategory │
│  5. Open modal           │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│   SomeProductForm       │
│  - Chargement données   │
│  - useEffect détecte    │
│    productToEdit        │
│  - Pré-remplissage      │
│  - Modification         │
└────────┬────────────────┘
         │ handleSubmit()
         │ avec ID inclus
         ▼
┌──────────────────────────────────┐
│  handleSaveSimplifiedProduct()   │
│  (mode édition détecté)          │
│                                  │
│  1. Formater les données         │
│  2. Appeler modifierProduit()    │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│     API Backend         │
│  PUT /api/v1/produits/:id│
└─────────────────────────┘
```

---

## 🎯 Handlers principaux (page.tsx)

### handleSaveSimplifiedProduct

**Rôle** : Formater et envoyer les données à l'API

```typescript
const handleSaveSimplifiedProduct = async (productData: any) => {
  try {
    // 1. Détecter mode (création vs édition)
    const isEdit = productData.id && productToEdit;

    // 2. Formater variants selon le type
    let variantsFormatted: any = {
      type: productData.category || 'generic',
      variants: [],
      options: []
    };

    if (productData.category === 'vetements' && Array.isArray(productData.variants)) {
      variantsFormatted = {
        type: 'vetements',
        variants: productData.variants.map(v => ({
          id: v.id,
          image: v.image,
          couleur: v.couleur,
          tailles: v.tailles,
          prix: v.prix,
          prix_promo: v.prix_promo
        })),
        personnalisations: productData.personnalisations || []
      };
    }
    // ... même logique pour chaussures et autres

    // 3. Calculer stock total
    let stockTotal = 0;
    if (productData.category === 'vetements') {
      stockTotal = productData.variants.reduce((sum, v) => {
        const variantStock = v.tailles?.reduce((s, t) => s + t.stock, 0) || 0;
        return sum + variantStock;
      }, 0);
    }
    // ... même logique pour chaussures et autres

    // 4. Calculer prix principal
    let prixPrincipal = 0;
    let prixOriginal = undefined;
    
    const variantsAvecPrix = productData.variants.filter(v => v.prix > 0);
    if (variantsAvecPrix.length > 0) {
      const prixMin = Math.min(...variantsAvecPrix.map(v => v.prix));
      const variantAvecPrixMin = variantsAvecPrix.find(v => v.prix === prixMin);
      
      prixPrincipal = variantAvecPrixMin.prix_promo || variantAvecPrixMin.prix;
      if (variantAvecPrixMin.prix_promo) {
        prixOriginal = variantAvecPrixMin.prix;
      }
    }

    // 5. Appeler API
    if (isEdit) {
      await modifierProduit(productData.id, {
        nom: productData.nom,
        slug: genererSlugProduit(productData.nom),
        description: productData.description,
        prix: prixPrincipal,
        prix_promo: prixOriginal ? prixPrincipal : undefined,
        en_stock: stockTotal,
        categorie_id: productData.categorie_id,
        images: productData.images,
        image_principale: productData.images[0],
        variants: variantsFormatted,
        statut: productData.statut
      });
    } else {
      await creerProduit({ /* même structure */ });
    }

    // 6. Mettre à jour l'UI
    setProducts(/* nouvelle liste */);
    success('Produit enregistré!');
    
    // 7. Nettoyer
    setShowSimplifiedModal(false);
    setSelectedCategory(null);
    setProductToEdit(null);
  } catch (error) {
    showError(error.message);
  }
};
```

### handleEditProduct

**Rôle** : Détecter le type et ouvrir le bon formulaire

```typescript
const handleEditProduct = (product: ProduitAffichage) => {
  // 1. Détecter le type
  const productType = product.variants?.type;

  // 2. Router selon le type
  if (productType === 'vetements') {
    const productData = {
      id: product.id,
      nom: product.nom,
      description: product.description,
      categorie_id: product.categorie?.id || 0,
      statut: product.actif ? 'actif' as const : 'inactif' as const,
      images: product.images || [],
      variants: product.variants?.variants || [],
      personnalisations: product.variants?.personnalisations || []
    };
    
    setProductToEdit(productData);
    setSelectedCategory('vetements');
    setShowSimplifiedModal(true);
    return;
  }
  
  // ... même logique pour chaussures et autres
  
  // Fallback : ancien modal pour types legacy
  setProductToEdit(convertToLegacyFormat(product));
  setShowProductModal(true);
};
```

---

## 🔐 Gestion de l'état

### États principaux

```typescript
// Dans page.tsx

// Modals
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [showSimplifiedModal, setShowSimplifiedModal] = useState(false);

// Sélection et édition
const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
const [productToEdit, setProductToEdit] = useState<any>(null);
```

### Réinitialisation importante

```typescript
// Fonction de fermeture complète
const handleCloseSimplifiedModals = () => {
  setShowCategoryModal(false);
  setShowSimplifiedModal(false);
  setSelectedCategory(null);
  setProductToEdit(null);  // ⚠️ CRUCIAL pour éviter l'édition accidentelle
};

// Lors de l'ouverture d'un nouveau produit
const handleCreateSimplifiedProduct = () => {
  setProductToEdit(null);       // ⚠️ Nettoyer l'édition
  setSelectedCategory(null);    // ⚠️ Réinitialiser catégorie
  setShowCategoryModal(true);
};
```

---

## 🎨 Styling et responsive

### Classes Tailwind communes

```typescript
// Sections
const sectionClasses = "space-y-6";
const sectionHeaderClasses = "bg-blue-50 border border-blue-200 rounded-lg p-4";

// Inputs
const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

// Boutons
const primaryButtonClasses = "px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700";
const secondaryButtonClasses = "px-4 sm:px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50";

// Responsive
const responsiveTextClasses = "hidden sm:inline"; // Texte complet desktop
const mobileTextClasses = "sm:hidden";           // Texte court mobile
```

### Exemple responsive

```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
  <span className="hidden sm:inline">Ajouter un variant</span>
  <span className="sm:hidden">Ajouter</span>
</button>
```

---

## 📦 Upload d'images

### Service d'upload

```typescript
// src/lib/services/upload.ts

export async function uploadImage(
  file: File,
  boutiqueSlug: string,
  folder: string = 'produits'
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('boutique', boutiqueSlug);
  formData.append('folder', folder);

  const response = await fetch('/api/v1/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'upload');
  }

  return await response.json();
}
```

### Utilisation dans les formulaires

```typescript
const uploadImages = async () => {
  // 1. Vérifier si déjà uploadées (mode édition)
  const allImagesAreUrls = formData.images.every(img => 
    img.startsWith('http://') || img.startsWith('https://')
  );
  
  if (allImagesAreUrls) {
    setUploadedImageUrls(formData.images);
    return;
  }

  // 2. Convertir base64 en File
  setIsUploadingImages(true);
  try {
    const uploadPromises = formData.images.map(async (base64Image) => {
      const blob = await fetch(base64Image).then(r => r.blob());
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const file = new File([blob], `product-${timestamp}-${random}.jpg`, { 
        type: 'image/jpeg' 
      });
      
      // 3. Upload
      const { uploadImage } = await import('@/lib/services/upload');
      const result = await uploadImage(file, boutiqueSlug, 'produits');
      return result.url;
    });

    // 4. Attendre tous les uploads
    const uploadedUrls = await Promise.all(uploadPromises);
    
    // 5. Mettre à jour l'état
    setUploadedImageUrls(uploadedUrls);
    setFormData(prev => ({ ...prev, images: uploadedUrls }));
  } catch (error) {
    console.error('Erreur upload:', error);
    throw error;
  } finally {
    setIsUploadingImages(false);
  }
};
```

---

## 🧪 Tests et validation

### Validation des sections

```typescript
const validateSection = (section: number): boolean => {
  const newErrors: Record<string, string> = {};

  switch (section) {
    case 1: // Infos de base
      if (!formData.nom.trim()) {
        newErrors.nom = 'Le nom est requis';
      }
      if (!formData.categorie_id) {
        newErrors.categorie_id = 'La catégorie est requise';
      }
      break;

    case 2: // Images
      if (formData.images.length === 0) {
        newErrors.images = 'Au moins une image est requise';
      }
      break;

    case 3: // Variants
      if (formData.variants.length === 0) {
        newErrors.variants = 'Au moins un variant est requis';
      } else {
        formData.variants.forEach((variant, index) => {
          // Validation spécifique selon le type de formulaire
          if (!variant.couleur) {
            newErrors[`variant_${index}_couleur`] = 'Couleur requise';
          }
          if (variant.prix <= 0) {
            newErrors[`variant_${index}_prix`] = 'Prix invalide';
          }
          if (variant.prix_promo && variant.prix_promo >= variant.prix) {
            newErrors[`variant_${index}_prix_promo`] = 'Prix promo doit être < prix normal';
          }
        });
      }
      break;

    case 4: // Personnalisations
      formData.personnalisations.forEach((custom, index) => {
        if (!custom.libelle.trim()) {
          newErrors[`custom_${index}_libelle`] = 'Libellé requis';
        }
      });
      break;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

## 🚀 Optimisations

### localStorage (brouillon)

```typescript
// Clés différentes par type
const DRAFT_KEYS = {
  vetements: 'clothing_product_draft',
  chaussures: 'shoes_product_draft',
  autres: 'generic_product_draft'
};

// Sauvegarde
useEffect(() => {
  if (isOpen && isDirty && isFormFilled() && !productToEdit) {
    localStorage.setItem(DRAFT_KEYS[category], JSON.stringify(formData));
  }
}, [formData, isOpen, isDirty, productToEdit]);

// Chargement
useEffect(() => {
  if (isOpen && !productToEdit) {
    const draft = localStorage.getItem(DRAFT_KEYS[category]);
    if (draft && !isDirty) {
      const shouldLoad = confirm('Un brouillon a été trouvé. Charger ?');
      if (shouldLoad) {
        setFormData(JSON.parse(draft));
        setIsDirty(true);
      } else {
        localStorage.removeItem(DRAFT_KEYS[category]);
      }
    }
  }
}, [isOpen, productToEdit]);
```

### Réinitialisation du formulaire

```typescript
useEffect(() => {
  if (!isOpen) {
    // Fermeture : tout réinitialiser
    resetForm();
  } else if (isOpen && !productToEdit) {
    // Ouverture en mode création : formulaire vide
    resetForm();
    preSelectCategory();
  }
  // Mode édition géré dans un autre useEffect
}, [isOpen, productToEdit]);
```

---

## 📝 Checklist d'intégration

### Pour ajouter un nouveau type de formulaire

- [ ] Créer le composant formulaire dans `/components/admin/products/`
- [ ] Définir les interfaces TypeScript spécifiques
- [ ] Implémenter les 4 sections
- [ ] Ajouter la validation
- [ ] Gérer l'upload d'images
- [ ] Implémenter le brouillon localStorage
- [ ] Exporter dans `index.ts`
- [ ] Ajouter le type dans `product-categories.ts`
- [ ] Ajouter le routage dans `SimplifiedProductModal.tsx`
- [ ] Ajouter la gestion dans `handleEditProduct`
- [ ] Ajouter le formatage dans `handleSaveSimplifiedProduct`
- [ ] Tester création et édition
- [ ] Documenter

---

## 🐛 Debugging

### Logs utiles

```typescript
// Dans handleEditProduct
console.log('[handleEditProduct] Type détecté:', productType);
console.log('[handleEditProduct] Données:', productData);

// Dans le formulaire
console.log('📝 Chargement édition:', productToEdit);
console.log('💾 Sauvegarde:', formData);
console.log('✅ Images uploadées:', uploadedImageUrls);

// Dans handleSaveSimplifiedProduct
console.log('📦 Données formatées:', {
  variants: variantsFormatted,
  stockTotal,
  prixPrincipal
});
```

### Problèmes fréquents

**Formulaire ne se réinitialise pas** :
```typescript
// Vérifier que productToEdit est bien null
console.log('productToEdit:', productToEdit);

// S'assurer de la réinitialisation
const handleClose = () => {
  setProductToEdit(null);  // ⚠️ Important !
  onClose();
};
```

**Images ne s'uploadent pas** :
```typescript
// Vérifier boutiqueSlug
console.log('boutiqueSlug:', boutiqueSlug);

// Vérifier format images
console.log('Images avant upload:', formData.images);
console.log('Est base64 ?', formData.images[0].startsWith('data:image'));
```

---

## 📚 Ressources

- [React Hooks](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js](https://nextjs.org/docs)
