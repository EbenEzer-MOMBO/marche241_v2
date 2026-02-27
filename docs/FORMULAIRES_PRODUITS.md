# Documentation des Formulaires de Produits

## Vue d'ensemble

Le système de gestion des produits dispose de **3 formulaires spécialisés** pour faciliter l'ajout et la modification de produits :

1. **Formulaire Vêtements** (`ClothingProductForm`) - Pour les articles de mode
2. **Formulaire Chaussures** (`ShoesProductForm`) - Pour les chaussures de tous types
3. **Formulaire Générique** (`GenericProductForm`) - Pour tous les autres produits avec attributs personnalisables

---

## 📋 Table des matières

- [Sélection du type de produit](#sélection-du-type-de-produit)
- [Formulaire Vêtements](#formulaire-vêtements)
- [Formulaire Chaussures](#formulaire-chaussures)
- [Formulaire Générique (Autres)](#formulaire-générique-autres)
- [Structure des données](#structure-des-données)
- [Exemples de produits usuels](#exemples-de-produits-usuels)

---

## Sélection du type de produit

Lors de l'ajout d'un nouveau produit, un modal de sélection propose 3 options :

### Interface de sélection

```typescript
// CategorySelectionModal.tsx
const SIMPLIFIED_CATEGORIES = [
  {
    id: 'vetements',
    nom: 'Vêtements',
    description: 'T-shirts, robes, pantalons, etc.',
    icon: <Shirt />,
    bgColor: 'bg-purple-50',
    color: 'text-purple-700'
  },
  {
    id: 'chaussures',
    nom: 'Chaussures',
    description: 'Baskets, sandales, bottes, etc.',
    icon: <ShoppingBag />,
    bgColor: 'bg-blue-50',
    color: 'text-blue-700'
  },
  {
    id: 'autres',
    nom: 'Autres',
    description: 'Électronique, beauté, alimentation, etc.',
    icon: <Package />,
    bgColor: 'bg-green-50',
    color: 'text-green-700'
  }
];
```

---

## Formulaire Vêtements

### 📝 Description

Le formulaire vêtements permet de gérer des produits avec :
- **Plusieurs couleurs** (variants)
- **Plusieurs tailles par couleur** (XS à 5XL)
- **Stock indépendant par taille**
- **Prix par variant** (avec option prix promo)

### 🎯 Cas d'usage

Idéal pour :
- T-shirts, chemises, pulls
- Robes, jupes, pantalons
- Vestes, manteaux
- Sous-vêtements
- Accessoires de mode avec tailles

### 📊 Structure en 4 sections

#### Section 1 : Informations de base
- Nom du produit
- Description
- Catégorie (sélection dans la BDD)
- Statut (actif/inactif/brouillon)

#### Section 2 : Images
- Upload multiple d'images
- Réorganisation par glisser-déposer
- Première image = image principale
- Upload automatique lors du passage à la section suivante

#### Section 3 : Variants (Couleurs et Tailles)
- **Création de variants par couleur**
- Pour chaque variant :
  - Sélection d'une image parmi celles uploadées
  - Choix de la couleur (liste prédéfinie ou personnalisée)
  - Sélection de plusieurs tailles (XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL)
  - Saisie du stock pour chaque taille
  - Prix de base et prix promo
  - Affichage du stock total du variant

#### Section 4 : Personnalisations (optionnel)
- Ajout d'options de personnalisation client
- Pour chaque personnalisation :
  - Libellé (ex: "Broderie du nom")
  - Type (texte ou nombre)
  - Prix supplémentaire
  - Obligatoire ou non

### 💾 Format de données

```typescript
// Structure d'un variant vêtement
interface ClothingVariant {
  id: string;
  image?: string;
  couleur: string;
  tailles: Array<{ 
    taille: string;    // "S", "M", "L", etc.
    stock: number;     // Stock pour cette taille
  }>;
  prix: number;
  prix_promo?: number;
}

// Exemple de produit vêtement complet
{
  "nom": "T-shirt Premium",
  "description": "T-shirt en coton bio, coupe ajustée",
  "categorie_id": 12,
  "statut": "actif",
  "images": [
    "https://cdn.example.com/tshirt-1.jpg",
    "https://cdn.example.com/tshirt-2.jpg"
  ],
  "category": "vetements",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/tshirt-noir.jpg",
      "couleur": "Noir",
      "tailles": [
        { "taille": "S", "stock": 5 },
        { "taille": "M", "stock": 10 },
        { "taille": "L", "stock": 8 },
        { "taille": "XL", "stock": 3 }
      ],
      "prix": 15000,
      "prix_promo": 12000
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/tshirt-blanc.jpg",
      "couleur": "Blanc",
      "tailles": [
        { "taille": "S", "stock": 7 },
        { "taille": "M", "stock": 12 },
        { "taille": "L", "stock": 6 }
      ],
      "prix": 15000
    }
  ],
  "personnalisations": [
    {
      "id": "custom-1",
      "libelle": "Broderie du nom",
      "type": "text",
      "prix_supplementaire": 2000,
      "obligatoire": false
    }
  ]
}
```

### 📱 Calculs automatiques

Le système calcule automatiquement :

```typescript
// Stock total d'un variant = somme des stocks de toutes les tailles
const stockVariant = variant.tailles.reduce((sum, t) => sum + t.stock, 0);

// Stock total du produit = somme des stocks de tous les variants
const stockTotal = variants.reduce((sum, v) => {
  const variantStock = v.tailles.reduce((s, t) => s + t.stock, 0);
  return sum + variantStock;
}, 0);

// Prix principal = prix le plus bas (avec promo si disponible)
const prixPrincipal = Math.min(...variants.map(v => v.prix_promo || v.prix));
```

---

## Formulaire Chaussures

### 📝 Description

Le formulaire chaussures permet de gérer des produits avec :
- **Plusieurs couleurs** (variants)
- **Plusieurs pointures par couleur** (35 à 48)
- **Stock indépendant par pointure**
- **Prix par variant**

### 🎯 Cas d'usage

Idéal pour :
- Baskets, sneakers
- Sandales, tongs
- Bottes, bottines
- Chaussures de ville
- Chaussures de sport

### 📊 Structure en 4 sections

#### Section 1 : Informations de base
Identique au formulaire vêtements

#### Section 2 : Images
Identique au formulaire vêtements

#### Section 3 : Variants (Couleurs et Pointures)
- **Création de variants par couleur**
- Pour chaque variant :
  - Sélection d'une image
  - Choix de la couleur
  - **Sélection de plusieurs pointures** (35, 36, 37... jusqu'à 48)
  - Saisie du stock pour chaque pointure
  - Prix de base et prix promo
  - Affichage du stock total (nombre de paires)

#### Section 4 : Personnalisations
Identique au formulaire vêtements

### 💾 Format de données

```typescript
// Structure d'un variant chaussure
interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{
    pointure: string;  // "40", "41", "42", etc.
    stock: number;     // Nombre de paires pour cette pointure
  }>;
  prix: number;
  prix_promo?: number;
}

// Exemple de produit chaussure complet
{
  "nom": "Nike Air Max 2024",
  "description": "Chaussures de running avec amorti Air Max",
  "categorie_id": 15,
  "statut": "actif",
  "images": [
    "https://cdn.example.com/airmax-1.jpg",
    "https://cdn.example.com/airmax-2.jpg"
  ],
  "category": "chaussures",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/airmax-noir.jpg",
      "couleur": "Noir",
      "pointures": [
        { "pointure": "40", "stock": 3 },
        { "pointure": "41", "stock": 5 },
        { "pointure": "42", "stock": 8 },
        { "pointure": "43", "stock": 4 },
        { "pointure": "44", "stock": 2 }
      ],
      "prix": 85000,
      "prix_promo": 75000
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/airmax-blanc.jpg",
      "couleur": "Blanc/Rouge",
      "pointures": [
        { "pointure": "40", "stock": 4 },
        { "pointure": "41", "stock": 6 },
        { "pointure": "42", "stock": 5 }
      ],
      "prix": 85000
    }
  ],
  "personnalisations": []
}
```

### 📱 Calculs automatiques

```typescript
// Stock total d'un variant = somme des stocks de toutes les pointures
const stockVariant = variant.pointures.reduce((sum, p) => sum + p.stock, 0);

// Stock total du produit = somme des stocks de tous les variants (en paires)
const stockTotal = variants.reduce((sum, v) => {
  const variantStock = v.pointures.reduce((s, p) => s + p.stock, 0);
  return sum + variantStock;
}, 0);
```

---

## Formulaire Générique (Autres)

### 📝 Description

Le formulaire générique permet de gérer **tous les autres types de produits** avec des **attributs personnalisables** :
- **Attributs flexibles** : couleur, taille, contenance
- **Stock unique par variant** (pas de sous-divisions)
- **Plusieurs attributs par variant**

### 🎯 Cas d'usage

Idéal pour :
- **Électronique** : téléphones, ordinateurs, accessoires
- **Beauté** : maquillage, parfums, soins
- **Alimentation** : boissons, snacks, épices
- **Maison** : décoration, ustensiles
- **Bijoux** : colliers, bracelets, bagues
- Tout produit nécessitant des attributs personnalisés

### 📊 Structure en 4 sections

#### Section 1 : Informations de base
Identique aux autres formulaires

#### Section 2 : Images
Identique aux autres formulaires

#### Section 3 : Variants avec attributs personnalisables
- **Création de variants avec attributs flexibles**
- Pour chaque variant :
  - Sélection d'une image
  - **Ajout d'attributs dynamiques** :
    - **Couleur** : Liste prédéfinie (Noir, Blanc, Gris, Bleu, Rouge, Vert, etc.)
    - **Taille** : Liste prédéfinie (XS, S, M, L, XL, XXL, 3XL)
    - **Contenance** : Liste prédéfinie (50ml, 100ml, 250ml, 500ml, 1L, 2L, 5L)
  - Possibilité de **combiner plusieurs types d'attributs** par variant
  - **Stock unique** pour le variant (pas de subdivision)
  - Prix de base et prix promo

#### Section 4 : Personnalisations
Identique aux autres formulaires

### 💾 Format de données

```typescript
// Structure d'un attribut
interface VariantAttribute {
  type: 'couleur' | 'taille' | 'contenance';
  value: string;
}

// Structure d'un variant générique
interface GenericVariant {
  id: string;
  image?: string;
  attributes: VariantAttribute[];  // Liste d'attributs
  stock: number;                   // Stock unique (pas de subdivision)
  prix: number;
  prix_promo?: number;
}
```

### 📦 Exemples par type de produit

#### 1. Électronique - Smartphone

```json
{
  "nom": "iPhone 15 Pro",
  "description": "Smartphone haut de gamme avec puce A17 Pro",
  "categorie_id": 20,
  "statut": "actif",
  "category": "autres",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/iphone-noir-256.jpg",
      "attributes": [
        { "type": "couleur", "value": "Noir" },
        { "type": "contenance", "value": "256GB" }
      ],
      "stock": 15,
      "prix": 850000,
      "prix_promo": 800000
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/iphone-blanc-512.jpg",
      "attributes": [
        { "type": "couleur", "value": "Blanc" },
        { "type": "contenance", "value": "512GB" }
      ],
      "stock": 8,
      "prix": 1050000
    }
  ]
}
```

#### 2. Beauté - Parfum

```json
{
  "nom": "Dior Sauvage",
  "description": "Eau de parfum pour homme, notes boisées",
  "categorie_id": 25,
  "statut": "actif",
  "category": "autres",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/dior-50ml.jpg",
      "attributes": [
        { "type": "contenance", "value": "50ml" }
      ],
      "stock": 20,
      "prix": 45000
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/dior-100ml.jpg",
      "attributes": [
        { "type": "contenance", "value": "100ml" }
      ],
      "stock": 15,
      "prix": 75000,
      "prix_promo": 65000
    }
  ]
}
```

#### 3. Alimentation - Jus de fruits

```json
{
  "nom": "Jus d'Orange Pressé Bio",
  "description": "100% pur jus d'orange, sans sucre ajouté",
  "categorie_id": 30,
  "statut": "actif",
  "category": "autres",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/jus-orange-500ml.jpg",
      "attributes": [
        { "type": "contenance", "value": "500ml" }
      ],
      "stock": 50,
      "prix": 1500
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/jus-orange-1l.jpg",
      "attributes": [
        { "type": "contenance", "value": "1L" }
      ],
      "stock": 30,
      "prix": 2500
    }
  ]
}
```

#### 4. Maison - Coussin décoratif

```json
{
  "nom": "Coussin Velours Premium",
  "description": "Coussin en velours doux avec fermeture éclair",
  "categorie_id": 35,
  "statut": "actif",
  "category": "autres",
  "variants": [
    {
      "id": "variant-1",
      "image": "https://cdn.example.com/coussin-bleu.jpg",
      "attributes": [
        { "type": "couleur", "value": "Bleu" },
        { "type": "taille", "value": "45x45cm" }
      ],
      "stock": 25,
      "prix": 8000
    },
    {
      "id": "variant-2",
      "image": "https://cdn.example.com/coussin-rose.jpg",
      "attributes": [
        { "type": "couleur", "value": "Rose" },
        { "type": "taille", "value": "45x45cm" }
      ],
      "stock": 18,
      "prix": 8000
    },
    {
      "id": "variant-3",
      "image": "https://cdn.example.com/coussin-gris.jpg",
      "attributes": [
        { "type": "couleur", "value": "Gris" },
        { "type": "taille", "value": "60x60cm" }
      ],
      "stock": 12,
      "prix": 12000
    }
  ]
}
```

### 📱 Calculs automatiques

```typescript
// Stock total du produit = somme des stocks de tous les variants
const stockTotal = variants.reduce((sum, v) => sum + v.stock, 0);

// Prix principal = prix le plus bas
const prixPrincipal = Math.min(...variants.map(v => v.prix_promo || v.prix));
```

---

## Structure des données

### 📤 Format d'envoi à l'API

Tous les formulaires envoient les données dans ce format unifié :

```typescript
{
  // Informations de base
  "nom": string,
  "slug": string,                    // Généré automatiquement
  "description": string,
  "categorie_id": number,
  "statut": "actif" | "inactif" | "brouillon",
  "boutique_id": number,
  
  // Images
  "images": string[],                // URLs après upload
  "image_principale": string,        // Première image
  
  // Pricing et stock
  "prix": number,                    // Prix minimum
  "prix_original"?: number,          // Si promo
  "en_stock": number,                // Stock total calculé
  
  // Variants (structure spécifique selon le type)
  "variants": {
    "type": "vetements" | "chaussures" | "autres",
    "variants": Array<Variant>,      // Selon le type
    "personnalisations": Array<Customization>
  }
}
```

### 🔄 Gestion de l'édition

Pour éditer un produit existant :

1. Le système détecte le type via `variants.type`
2. Route vers le bon formulaire
3. Pré-remplit les champs avec les données existantes
4. Les images ne sont pas re-uploadées (URLs conservées)
5. L'ID du produit est inclus dans la sauvegarde

```typescript
// Détection du type lors de l'édition
const productType = product.variants?.type;

if (productType === 'vetements') {
  // Ouvrir ClothingProductForm
} else if (productType === 'chaussures') {
  // Ouvrir ShoesProductForm
} else if (productType === 'autres') {
  // Ouvrir GenericProductForm
}
```

---

## Exemples de produits usuels

### 👕 Vêtements

#### T-shirt basique
```json
{
  "nom": "T-shirt Col Rond Uni",
  "variants": [
    {
      "couleur": "Noir",
      "tailles": [
        { "taille": "S", "stock": 10 },
        { "taille": "M", "stock": 15 },
        { "taille": "L", "stock": 12 }
      ],
      "prix": 8000
    }
  ]
}
```

#### Robe de soirée
```json
{
  "nom": "Robe Cocktail Élégante",
  "variants": [
    {
      "couleur": "Rouge",
      "tailles": [
        { "taille": "36", "stock": 2 },
        { "taille": "38", "stock": 3 },
        { "taille": "40", "stock": 2 }
      ],
      "prix": 45000,
      "prix_promo": 35000
    },
    {
      "couleur": "Noir",
      "tailles": [
        { "taille": "38", "stock": 4 },
        { "taille": "40", "stock": 3 }
      ],
      "prix": 45000
    }
  ],
  "personnalisations": [
    {
      "libelle": "Ajustement sur mesure",
      "type": "text",
      "prix_supplementaire": 10000,
      "obligatoire": false
    }
  ]
}
```

### 👟 Chaussures

#### Baskets sport
```json
{
  "nom": "Adidas Ultraboost",
  "variants": [
    {
      "couleur": "Blanc",
      "pointures": [
        { "pointure": "40", "stock": 5 },
        { "pointure": "41", "stock": 8 },
        { "pointure": "42", "stock": 10 },
        { "pointure": "43", "stock": 6 }
      ],
      "prix": 95000
    },
    {
      "couleur": "Noir/Orange",
      "pointures": [
        { "pointure": "41", "stock": 4 },
        { "pointure": "42", "stock": 7 },
        { "pointure": "43", "stock": 5 }
      ],
      "prix": 95000,
      "prix_promo": 85000
    }
  ]
}
```

#### Sandales d'été
```json
{
  "nom": "Sandales Cuir Confort",
  "variants": [
    {
      "couleur": "Marron",
      "pointures": [
        { "pointure": "39", "stock": 8 },
        { "pointure": "40", "stock": 12 },
        { "pointure": "41", "stock": 10 },
        { "pointure": "42", "stock": 6 }
      ],
      "prix": 25000
    }
  ]
}
```

### 📦 Autres produits

#### Ordinateur portable
```json
{
  "nom": "MacBook Air M2",
  "category": "autres",
  "variants": [
    {
      "attributes": [
        { "type": "couleur", "value": "Gris sidéral" },
        { "type": "contenance", "value": "256GB" }
      ],
      "stock": 5,
      "prix": 1200000
    },
    {
      "attributes": [
        { "type": "couleur", "value": "Argent" },
        { "type": "contenance", "value": "512GB" }
      ],
      "stock": 3,
      "prix": 1450000
    }
  ]
}
```

#### Crème de beauté
```json
{
  "nom": "Crème Hydratante Visage",
  "category": "autres",
  "variants": [
    {
      "attributes": [
        { "type": "contenance", "value": "50ml" }
      ],
      "stock": 30,
      "prix": 15000
    },
    {
      "attributes": [
        { "type": "contenance", "value": "100ml" }
      ],
      "stock": 20,
      "prix": 25000,
      "prix_promo": 22000
    }
  ]
}
```

#### Bouteille d'eau
```json
{
  "nom": "Bouteille Isotherme Inox",
  "category": "autres",
  "variants": [
    {
      "attributes": [
        { "type": "couleur", "value": "Noir" },
        { "type": "contenance", "value": "500ml" }
      ],
      "stock": 25,
      "prix": 12000
    },
    {
      "attributes": [
        { "type": "couleur", "value": "Bleu" },
        { "type": "contenance", "value": "1L" }
      ],
      "stock": 18,
      "prix": 18000
    }
  ]
}
```

---

## 🎨 Interface utilisateur

### Caractéristiques communes

Tous les formulaires partagent :

1. **Navigation en 4 étapes** numérotées (1, 2, 3, 4)
2. **Validation par étape** avant de passer à la suivante
3. **Sauvegarde automatique** en brouillon (localStorage)
4. **Upload d'images** avec prévisualisation
5. **Réorganisation** des images par glisser-déposer
6. **Mode responsive** adapté mobile/desktop
7. **Boutons contextuels** :
   - Retour vers sélection de catégorie
   - Précédent/Suivant entre sections
   - Enregistrer à la fin

### Boutons et actions

```typescript
// Sur mobile, les textes sont raccourcis
<button>
  <span className="hidden sm:inline">Ajouter un variant</span>
  <span className="sm:hidden">Ajouter</span>
</button>

// Les contrôles d'images sont toujours visibles sur mobile
<div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
  {/* Boutons de contrôle */}
</div>
```

---

## 🔒 Validation

### Règles de validation communes

**Section 1** :
- Nom requis (non vide)
- Catégorie requise (sélectionnée)

**Section 2** :
- Au moins 1 image requise

**Section 3** :
- Au moins 1 variant requis
- Pour vêtements : au moins 1 taille par variant
- Pour chaussures : au moins 1 pointure par variant
- Pour autres : au moins 1 attribut par variant
- Prix > 0
- Prix promo < prix normal (si renseigné)
- Stock >= 0

**Section 4** :
- Libellé requis si personnalisation ajoutée

---

## 🚀 Utilisation en frontend

### Flux de création

```typescript
// 1. Clic sur "Nouveau produit"
handleCreateSimplifiedProduct()
  → Ouvre CategorySelectionModal

// 2. Sélection d'un type
handleSelectCategory('vetements')
  → Ouvre ClothingProductForm

// 3. Remplissage du formulaire (4 sections)
// 4. Sauvegarde
handleSubmit()
  → Appelle onSave(productData)
  → handleSaveSimplifiedProduct(productData)
  → creerProduit(formattedData)
```

### Flux d'édition

```typescript
// 1. Clic sur "Modifier" un produit
handleEditProduct(product)
  → Détecte product.variants.type
  → Ouvre le formulaire correspondant avec productToEdit

// 2. Modification des données
// 3. Sauvegarde
handleSubmit()
  → Appelle onSave(productData) avec ID inclus
  → modifierProduit(productData.id, formattedData)
```

### Gestion de l'état

```typescript
// États principaux dans page.tsx
const [showCategoryModal, setShowCategoryModal] = useState(false);
const [showSimplifiedModal, setShowSimplifiedModal] = useState(false);
const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
const [productToEdit, setProductToEdit] = useState<any>(null);

// Réinitialisation lors de la fermeture
handleCloseSimplifiedModals() {
  setShowCategoryModal(false);
  setShowSimplifiedModal(false);
  setSelectedCategory(null);
  setProductToEdit(null);  // Important !
}
```

---

## 💡 Conseils et bonnes pratiques

### Pour les vêtements

1. **Photographier chaque couleur** pour une meilleure présentation
2. **Prévoir les tailles populaires** (S, M, L) en stock suffisant
3. **Utiliser les prix promo** pour les fins de collection
4. **Ajouter des personnalisations** (broderie, gravure) pour augmenter la valeur

### Pour les chaussures

1. **Photos sous plusieurs angles** (profil, dessus, semelle)
2. **Préciser la taille** (EU, US, UK) dans la description
3. **Indiquer le type de pied** (large, étroit) si pertinent
4. **Stock réaliste** : les pointures extrêmes se vendent moins

### Pour les autres produits

1. **Bien choisir les attributs** pertinents pour le produit
2. **Combiner attributs** quand nécessaire (ex: couleur + contenance)
3. **Images de qualité** : zoom sur détails importants
4. **Description complète** : spécifications techniques, dimensions, poids

---

## 🐛 Dépannage

### Problèmes courants

**Images ne s'uploadent pas** :
- Vérifier la connexion internet
- Vérifier le format (JPG, PNG acceptés)
- Taille maximale : 5MB par image

**Brouillon ne se charge pas** :
- Vérifier le localStorage du navigateur
- Le brouillon expire après 1 heure
- Différent pour chaque type (vetements, chaussures, autres)

**Formulaire ne se réinitialise pas** :
- Vérifier que `productToEdit` est bien `null`
- Forcer la fermeture complète du modal

---

## 📚 Références

### Fichiers principaux

- `/src/components/admin/products/CategorySelectionModal.tsx` - Sélection du type
- `/src/components/admin/products/ClothingProductForm.tsx` - Formulaire vêtements
- `/src/components/admin/products/ShoesProductForm.tsx` - Formulaire chaussures
- `/src/components/admin/products/GenericProductForm.tsx` - Formulaire générique
- `/src/components/admin/products/SimplifiedProductModal.tsx` - Routeur de formulaires
- `/src/app/admin/[boutique]/products/page.tsx` - Page principale avec handlers

### Types TypeScript

```typescript
// product-categories.ts
type ProductCategory = 'vetements' | 'chaussures' | 'autres' | ...

// ClothingProductForm.tsx
interface ClothingVariant {
  id: string;
  image?: string;
  couleur: string;
  tailles: Array<{ taille: string; stock: number }>;
  prix: number;
  prix_promo?: number;
}

// ShoesProductForm.tsx
interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{ pointure: string; stock: number }>;
  prix: number;
  prix_promo?: number;
}

// GenericProductForm.tsx
interface GenericVariant {
  id: string;
  image?: string;
  attributes: Array<{ type: string; value: string }>;
  stock: number;
  prix: number;
  prix_promo?: number;
}

interface Customization {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  prix_supplementaire?: number;
  obligatoire: boolean;
}
```

---

## ✨ Conclusion

Les 3 formulaires spécialisés offrent une expérience optimisée pour chaque type de produit :

- **Vêtements** : Gestion avancée des tailles par couleur
- **Chaussures** : Gestion précise des pointures par couleur  
- **Autres** : Flexibilité maximale avec attributs personnalisables

Chaque formulaire partage une interface cohérente tout en s'adaptant aux spécificités de son domaine.
