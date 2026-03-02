# Guide Technique - Composants d'Affichage des Produits

## 🎨 Vue d'ensemble

Les composants d'affichage permettent de présenter les informations produit de manière optimisée selon leur type (vêtements, chaussures, autres).

```
┌────────────────────────────────────────────────────────┐
│            ProductDetail.tsx (Router)                   │
│  - Détecte le type de produit (variants.type)          │
│  - Route vers le composant adapté                       │
│  - Gère le panier et les toasts                         │
└────────────┬───────────────────────────────────────────┘
             │
             ├─► ClothingProductDisplay (si type === 'vetements')
             ├─► ShoesProductDisplay (si type === 'chaussures')
             └─► GenericProductDisplay (si type === 'autres' ou autre)
```

---

## 📁 Structure des fichiers

```
src/components/products/
├── ClothingProductDisplay.tsx    # Affichage vêtements
├── ShoesProductDisplay.tsx       # Affichage chaussures
├── GenericProductDisplay.tsx     # Affichage générique
└── index.ts                      # Exports
```

---

## 🔧 Composants en détail

### ClothingProductDisplay

**Rôle** : Afficher les vêtements avec sélection de couleur et taille

#### Interface des données

```typescript
interface ClothingVariant {
  id: string;
  image?: string;
  couleur: string;
  tailles: Array<{
    taille: string;    // "XS", "S", "M", "L", "XL", etc.
    stock: number;
  }>;
  prix: number;
  prix_promo?: number;
}
```

#### Props

```typescript
interface ClothingProductDisplayProps {
  product: ProduitDetail;                    // Produit complet
  onVariantChange: (variantId: string, taille: string) => void;
  onAddToCart: () => void;                   // Action d'ajout au panier
  quantity: number;                          // Quantité sélectionnée
  onQuantityChange: (qty: number) => void;   // Changement de quantité
  isAddingToCart: boolean;                   // État du chargement
  selectedVariantId?: string;                // Variant sélectionné
  selectedTaille?: string;                   // Taille sélectionnée
}
```

#### Fonctionnalités

- ✅ **Ordre de sélection** : L'utilisateur choisit d'abord la **couleur**, puis la **taille** disponible
- ✅ **Affichage des variants** : Tous les variants de couleur sont affichés
- ✅ **Badge image** : Indicateur visuel si une image spécifique existe pour la couleur
- ✅ **Sélection de taille** : Grid responsive avec stock affiché par taille
- ✅ **Prix dynamique** : Affichage prix promo / prix barré
- ✅ **Gestion stock** : Désactivation si rupture + stock détaillé par taille
- ✅ **Design sobre** : Thème noir/gris pour une apparence élégante
- ✅ **Responsive** : Mobile-first design

#### Workflow utilisateur

1. **Étape 1 - Sélection de la couleur** :
   - Toutes les couleurs disponibles sont affichées
   - Les couleurs en rupture de stock (aucune taille disponible) sont désactivées et barrées
   - Un badge indique si une image spécifique existe pour la couleur
   - La première couleur disponible est présélectionnée

2. **Étape 2 - Sélection de la taille** :
   - Une fois la couleur choisie, les tailles disponibles pour cette couleur sont affichées
   - Les tailles en rupture de stock sont désactivées et barrées
   - Le stock disponible pour chaque taille est affiché entre parenthèses
   - La première taille disponible est présélectionnée

3. **Prix et quantité** :
   - Le prix (avec promo si applicable) est affiché
   - Contrôle de quantité avec limites basées sur le stock
   - Bouton "Ajouter au panier" avec design noir élégant

#### Exemple d'utilisation

```tsx
<ClothingProductDisplay
  product={productData}
  onVariantChange={(variantId, taille) => {
    setSelectedVariantId(variantId);
    setSelectedTaille(taille);
  }}
  onAddToCart={handleAddToCart}
  quantity={quantity}
  onQuantityChange={setQuantity}
  isAddingToCart={isAddingToCart}
/>
```

---

### ShoesProductDisplay

**Rôle** : Afficher les chaussures avec sélection de couleur et pointure

#### Interface des données

```typescript
interface ShoesVariant {
  id: string;
  image?: string;
  couleur: string;
  pointures: Array<{
    pointure: string;  // "35", "36", "37", etc.
    stock: number;
  }>;
  prix: number;
  prix_promo?: number;
}
```

#### Fonctionnalités spécifiques

- ✅ **Sélection de pointure** : Grid 4x6 avec stock par pointure
- ✅ **Guide des tailles** : Section dépliable avec conseils
- ✅ **Badge image** : Indicateur pour variants avec photo
- ✅ **Stock par pointure** : Affichage détaillé du stock

#### Design spécifique

- Couleur thème : **Bleu** (`blue-600`)
- Icône : `ShoppingBag` (Lucide)
- Label unités : "paire(s)"

---

### GenericProductDisplay

**Rôle** : Afficher tous les autres types de produits avec attributs flexibles

#### Interface des données

```typescript
interface GenericVariant {
  id: string;
  image?: string;
  attributes: Array<{
    type: string;      // "couleur", "taille", "contenance", etc.
    value: string;     // "Noir", "500ml", "Standard", etc.
  }>;
  stock: number;       // Stock unique (pas de subdivision)
  prix: number;
  prix_promo?: number;
}
```

#### Fonctionnalités

- ✅ **Attributs dynamiques** : Détection automatique des types
- ✅ **Labels français** : Traduction automatique (couleur, taille, contenance, etc.)
- ✅ **Combinaisons multiples** : Gestion de plusieurs attributs simultanés
- ✅ **Désactivation intelligente** : Combinaisons impossibles grisées

#### Mapping des attributs

```typescript
const attributeLabels: Record<string, string> = {
  'couleur': 'Couleur',
  'taille': 'Taille',
  'contenance': 'Contenance',
  'capacite': 'Capacité',
  'modele': 'Modèle',
  'version': 'Version'
};
```

#### Design spécifique

- Couleur thème : **Gris foncé** (`gray-900`)
- Icône : `Package` (Lucide)
- Label unités : "unité(s)"

---

## 🎯 Intégration dans ProductDetail

### Détection du type

```typescript
const detectProductType = (product: ProduitDetail): string => {
  // Vérifier si variants.type existe
  if (product.variants && typeof product.variants === 'object') {
    if ('type' in product.variants) {
      return product.variants.type;
    }
  }
  
  // Par défaut : générique
  return 'generic';
};
```

### Router vers le bon composant

```tsx
import {
  ClothingProductDisplay,
  ShoesProductDisplay,
  GenericProductDisplay
} from '@/components/products';

export default function ProductDetail({ product, ... }: Props) {
  const productType = detectProductType(product);
  
  // ... autres états et fonctions
  
  const renderProductDisplay = () => {
    switch (productType) {
      case 'vetements':
        return (
          <ClothingProductDisplay
            product={product}
            onVariantChange={handleVariantChange}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isAddingToCart={isAddingToCart}
          />
        );
      
      case 'chaussures':
        return (
          <ShoesProductDisplay
            product={product}
            onVariantChange={handleVariantChange}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isAddingToCart={isAddingToCart}
          />
        );
      
      default:
        return (
          <GenericProductDisplay
            product={product}
            onVariantChange={handleVariantChange}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            onQuantityChange={setQuantity}
            isAddingToCart={isAddingToCart}
          />
        );
    }
  };
  
  return (
    <div>
      {/* Galerie d'images */}
      <ImageGallery images={productImages} />
      
      {/* Informations produit */}
      <div>
        <h1>{product.nom}</h1>
        <p>{product.description}</p>
        
        {/* Router vers le bon composant d'affichage */}
        {renderProductDisplay()}
      </div>
    </div>
  );
}
```

---

## 🎨 Design System

### Couleurs par type

| Type | Couleur primaire | Classe Tailwind | Utilisation |
|------|-----------------|----------------|-------------|
| Vêtements | Violet | `purple-600` | Boutons, badges, focus |
| Chaussures | Bleu | `blue-600` | Boutons, badges, focus |
| Générique | Gris foncé | `gray-900` | Boutons, badges, focus |

### Composants communs

#### Bouton de sélection (actif)
```tsx
className="px-4 py-2 rounded-lg border-2 border-purple-600 bg-purple-600 text-white"
```

#### Bouton de sélection (inactif)
```tsx
className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-purple-300"
```

#### Bouton désactivé (rupture de stock)
```tsx
className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
```

#### Badge d'image associée
```tsx
<span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white" />
```

---

## 📊 Gestion de l'état

### États partagés

```typescript
// Variant sélectionné
const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

// Taille/Pointure sélectionnée
const [selectedSize, setSelectedSize] = useState<string>('');

// Quantité max disponible
const [maxQuantity, setMaxQuantity] = useState(1);
```

### Synchronisation automatique

```typescript
// Mettre à jour la quantité max quand la sélection change
useEffect(() => {
  if (selectedVariant && selectedSize) {
    const item = selectedVariant.tailles.find(t => t.taille === selectedSize);
    if (item) {
      setMaxQuantity(item.stock);
      if (quantity > item.stock) {
        onQuantityChange(Math.min(quantity, item.stock));
      }
    }
  }
}, [selectedVariant, selectedSize]);
```

---

## 🧪 Exemples de données

### Vêtement

```json
{
  "variants": {
    "type": "vetements",
    "variants": [
      {
        "id": "v1",
        "image": "https://...",
        "couleur": "Noir",
        "tailles": [
          { "taille": "M", "stock": 10 },
          { "taille": "L", "stock": 5 },
          { "taille": "XL", "stock": 0 }
        ],
        "prix": 25000,
        "prix_promo": 20000
      }
    ],
    "personnalisations": [
      {
        "id": "p1",
        "libelle": "Broderie du nom",
        "type": "text",
        "prix_supplementaire": 2000,
        "obligatoire": false
      }
    ]
  }
}
```

### Chaussure

```json
{
  "variants": {
    "type": "chaussures",
    "variants": [
      {
        "id": "v1",
        "couleur": "Noir",
        "pointures": [
          { "pointure": "40", "stock": 3 },
          { "pointure": "41", "stock": 5 },
          { "pointure": "42", "stock": 2 }
        ],
        "prix": 35000
      }
    ]
  }
}
```

### Produit générique

```json
{
  "variants": {
    "type": "generic",
    "variants": [
      {
        "id": "v1",
        "attributes": [
          { "type": "couleur", "value": "Noir" },
          { "type": "contenance", "value": "500ml" }
        ],
        "stock": 20,
        "prix": 15000
      }
    ]
  }
}
```

---

## 🔄 Callbacks

### onVariantChange

```typescript
// Pour vêtements et chaussures
onVariantChange: (variantId: string, size: string) => void

// Pour générique
onVariantChange: (variantId: string) => void
```

**Utilisation** :
- Mettre à jour l'état parent
- Changer l'image principale si le variant a une image
- Recalculer le stock disponible

### onAddToCart

```typescript
onAddToCart: () => void
```

**Actions attendues** :
1. Vérifier que tous les champs requis sont remplis
2. Appeler l'API d'ajout au panier
3. Afficher un toast de succès/erreur
4. Mettre à jour le compteur du panier

---

## ✅ Checklist d'intégration

- [x] Créer `ClothingProductDisplay.tsx`
- [x] Créer `ShoesProductDisplay.tsx`
- [x] Créer `GenericProductDisplay.tsx`
- [x] Exporter dans `index.ts`
- [ ] Intégrer dans `ProductDetail.tsx`
- [ ] Tester avec des données réelles
- [ ] Vérifier le responsive mobile
- [ ] Tester les transitions d'état
- [ ] Valider l'accessibilité (a11y)

---

## 🐛 Debugging

### Logs utiles

```typescript
// Détecter le type
console.log('Type de produit:', detectProductType(product));

// Vérifier les variants
console.log('Variants:', product.variants);

// Vérifier la sélection
console.log('Variant sélectionné:', selectedVariant);
console.log('Taille sélectionnée:', selectedSize);
console.log('Stock max:', maxQuantity);
```

### Problèmes fréquents

**Le composant ne s'affiche pas** :
- Vérifier que `product.variants.type` est bien défini
- Vérifier que `product.variants.variants` est un tableau
- Vérifier les imports dans `ProductDetail.tsx`

**Le stock n'est pas correct** :
- Vérifier la structure `tailles` / `pointures` / `stock`
- Vérifier la synchronisation dans `useEffect`
- Logger `maxQuantity` après chaque changement

**Les couleurs ne changent pas** :
- Vérifier que chaque variant a un `id` unique
- Vérifier que `onVariantChange` est bien appelé
- Vérifier que `selectedVariant` est mis à jour

---

## 📚 Ressources

- [Composants de formulaires](/docs/GUIDE_TECHNIQUE_FORMULAIRES.md)
- [Guide utilisateur](/docs/GUIDE_UTILISATION_FORMULAIRES.md)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
