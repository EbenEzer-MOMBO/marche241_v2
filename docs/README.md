# Documentation - Système de Gestion des Produits

## 📚 Vue d'ensemble

Ce système offre **3 formulaires spécialisés** pour faciliter l'ajout et la gestion de produits dans votre boutique en ligne.

---

## 📖 Documentation disponible

### 1. [FORMULAIRES_PRODUITS.md](./FORMULAIRES_PRODUITS.md) - Documentation complète
**Pour qui** : Tout le monde

**Contenu** :
- Description détaillée des 3 formulaires (Vêtements, Chaussures, Autres)
- Structure des données et format JSON
- Exemples de produits usuels par catégorie
- Calculs automatiques (stock, prix)
- Interface utilisateur et validation
- Références TypeScript

**📄 Sections principales** :
- Sélection du type de produit
- Formulaire Vêtements (tailles par couleur)
- Formulaire Chaussures (pointures par couleur)
- Formulaire Générique (attributs personnalisables)
- Structure des données API
- Exemples concrets : T-shirts, Baskets, Smartphones, Parfums, etc.

---

### 2. [GUIDE_UTILISATION_FORMULAIRES.md](./GUIDE_UTILISATION_FORMULAIRES.md) - Guide pratique
**Pour qui** : Vendeurs, utilisateurs finaux, formateurs

**Contenu** :
- Démarrage rapide en 3 étapes
- Scénarios d'utilisation détaillés
- Modification de produits existants
- Gestion des promotions
- Optimisation des images
- Tableau comparatif des formulaires
- Erreurs fréquentes et solutions
- Raccourcis et astuces
- Différences mobile/desktop
- Formation vendeur

**📄 Scénarios inclus** :
1. Boutique de mode - T-shirts multi-couleurs
2. Magasin de sport - Baskets Nike
3. Boutique tech - Smartphones Samsung
4. Boutique beauté - Parfums Chanel
5. Magasin alimentation - Jus de fruits

---

### 3. [GUIDE_TECHNIQUE_FORMULAIRES.md](./GUIDE_TECHNIQUE_FORMULAIRES.md) - Guide développeur
**Pour qui** : Développeurs, mainteneurs

**Contenu** :
- Architecture du système
- Structure des fichiers
- Détail des composants
- Interfaces TypeScript
- Flux de données (création/édition)
- Handlers principaux
- Gestion de l'état
- Upload d'images
- Validation et tests
- Optimisations
- Debugging
- Checklist d'intégration

**📄 Sections techniques** :
- Vue d'ensemble de l'architecture
- Détail de chaque composant
- Flux de création et d'édition
- Handlers `handleSaveSimplifiedProduct` et `handleEditProduct`
- Service d'upload d'images
- Gestion du localStorage (brouillon)
- Problèmes fréquents et solutions

---

## 🚀 Démarrage rapide

### Pour les utilisateurs

1. **Lire** : [GUIDE_UTILISATION_FORMULAIRES.md](./GUIDE_UTILISATION_FORMULAIRES.md)
2. **Suivre** : Scénarios d'utilisation
3. **Pratiquer** : Ajouter votre premier produit

### Pour les développeurs

1. **Lire** : [GUIDE_TECHNIQUE_FORMULAIRES.md](./GUIDE_TECHNIQUE_FORMULAIRES.md)
2. **Comprendre** : Architecture et flux de données
3. **Explorer** : Code source des composants

---

## 📊 Résumé des formulaires

| Formulaire | Type | Variants | Sous-divisions | Stock | Cas d'usage |
|------------|------|----------|----------------|-------|-------------|
| **Vêtements** | `vetements` | Couleur | Tailles (XS-5XL) | Par taille | T-shirts, robes, pantalons |
| **Chaussures** | `chaussures` | Couleur | Pointures (35-48) | Par pointure | Baskets, sandales, bottes |
| **Autres** | `autres` | Attributs flexibles | Aucune | Par variant | Électronique, beauté, alimentation |

---

## 🗂️ Structure du projet

```
src/
├── components/admin/products/
│   ├── CategorySelectionModal.tsx       # Sélection : 3 options
│   ├── SimplifiedProductModal.tsx       # Routeur de formulaires
│   ├── ClothingProductForm.tsx          # Formulaire vêtements
│   ├── ShoesProductForm.tsx             # Formulaire chaussures
│   ├── GenericProductForm.tsx           # Formulaire générique
│   └── index.ts                         # Exports
│
├── app/admin/[boutique]/products/
│   └── page.tsx                         # Page principale + handlers
│
├── lib/
│   ├── constants/product-categories.ts  # Types et catégories
│   ├── services/products.ts             # API produits
│   └── services/upload.ts               # API upload images
│
└── docs/
    ├── README.md                        # Ce fichier
    ├── FORMULAIRES_PRODUITS.md          # Documentation complète
    ├── GUIDE_UTILISATION_FORMULAIRES.md # Guide pratique
    └── GUIDE_TECHNIQUE_FORMULAIRES.md   # Guide développeur
```

---

## 🎯 Exemples rapides

### Vêtements - T-shirt

```json
{
  "nom": "T-shirt Premium",
  "category": "vetements",
  "variants": [
    {
      "couleur": "Noir",
      "tailles": [
        { "taille": "S", "stock": 10 },
        { "taille": "M", "stock": 15 },
        { "taille": "L", "stock": 8 }
      ],
      "prix": 15000,
      "prix_promo": 12000
    }
  ]
}
```

### Chaussures - Baskets

```json
{
  "nom": "Nike Air Max",
  "category": "chaussures",
  "variants": [
    {
      "couleur": "Blanc",
      "pointures": [
        { "pointure": "40", "stock": 5 },
        { "pointure": "41", "stock": 8 },
        { "pointure": "42", "stock": 6 }
      ],
      "prix": 85000
    }
  ]
}
```

### Autres - Smartphone

```json
{
  "nom": "iPhone 15 Pro",
  "category": "autres",
  "variants": [
    {
      "attributes": [
        { "type": "couleur", "value": "Noir" },
        { "type": "contenance", "value": "256GB" }
      ],
      "stock": 15,
      "prix": 850000
    }
  ]
}
```

---

## 🔧 Flux d'utilisation

### Création d'un produit

```
1. Clic "Nouveau produit"
   └─> Modal de sélection (3 options)

2. Sélection du type
   └─> Ouverture du formulaire approprié

3. Remplissage (4 sections)
   ├─> Section 1 : Infos de base
   ├─> Section 2 : Images (upload automatique)
   ├─> Section 3 : Variants (spécifique au type)
   └─> Section 4 : Personnalisations (optionnel)

4. Validation et sauvegarde
   └─> Formatage des données → Envoi API → Affichage
```

### Modification d'un produit

```
1. Clic "Modifier" sur un produit
   └─> Détection automatique du type

2. Ouverture du formulaire correspondant
   └─> Données pré-remplies

3. Modification des champs
   └─> Validation en temps réel

4. Sauvegarde
   └─> Mise à jour → Rafraîchissement
```

---

## 🎓 Cas d'usage par secteur

### 🛍️ Mode & Vêtements
→ **Formulaire** : Vêtements  
→ **Exemples** : T-shirts, robes, pantalons, vestes  
→ **Voir** : [Scénario 1](./GUIDE_UTILISATION_FORMULAIRES.md#scénario-1--boutique-de-mode---t-shirts)

### 👟 Chaussures & Accessoires
→ **Formulaire** : Chaussures  
→ **Exemples** : Baskets, sandales, bottes  
→ **Voir** : [Scénario 2](./GUIDE_UTILISATION_FORMULAIRES.md#scénario-2--magasin-de-sport---baskets)

### 📱 Électronique
→ **Formulaire** : Autres  
→ **Exemples** : Smartphones, ordinateurs, écouteurs  
→ **Voir** : [Scénario 3](./GUIDE_UTILISATION_FORMULAIRES.md#scénario-3--boutique-tech---smartphones)

### 💄 Beauté & Cosmétiques
→ **Formulaire** : Autres  
→ **Exemples** : Parfums, maquillage, soins  
→ **Voir** : [Scénario 4](./GUIDE_UTILISATION_FORMULAIRES.md#scénario-4--boutique-beauté---parfums)

### 🍊 Alimentation & Boissons
→ **Formulaire** : Autres  
→ **Exemples** : Jus, snacks, épices  
→ **Voir** : [Scénario 5](./GUIDE_UTILISATION_FORMULAIRES.md#scénario-5--magasin-alimentation---jus)

### 🏠 Maison & Décoration
→ **Formulaire** : Autres  
→ **Exemples** : Coussins, vaisselle, décoration  
→ **Voir** : [Exemples produits](./FORMULAIRES_PRODUITS.md#4-maison---coussin-décoratif)

---

## 💡 Caractéristiques clés

### ✨ Interface utilisateur
- **Navigation en 4 étapes** numérotées
- **Validation progressive** (section par section)
- **Upload automatique** des images
- **Sauvegarde brouillon** (localStorage)
- **Mode responsive** (mobile/desktop optimisé)

### 🎨 Personnalisation
- **Variants flexibles** selon le type de produit
- **Attributs personnalisables** (couleur, taille, contenance)
- **Options client** (personnalisations avec prix supplémentaire)
- **Prix promotionnels** par variant

### 🔒 Validation
- **Champs requis** vérifiés
- **Format des données** contrôlé
- **Prix cohérents** (promo < normal)
- **Stock valide** (>= 0)

### 📊 Calculs automatiques
- **Stock total** : Somme de tous les variants/tailles/pointures
- **Prix affiché** : Prix minimum (avec promo si disponible)
- **Stock par variant** : Agrégation automatique

---

## 🐛 Support et dépannage

### Problèmes fréquents

**Images ne s'uploadent pas** :
- Vérifier la connexion internet
- Format accepté : JPG, PNG (max 5MB)
- Voir : [Dépannage](./GUIDE_UTILISATION_FORMULAIRES.md#problèmes-courants)

**Brouillon ne se charge pas** :
- Vérifier le localStorage du navigateur
- Expiration après 1 heure
- Voir : [Dépannage](./GUIDE_UTILISATION_FORMULAIRES.md#problèmes-courants)

**Formulaire ne se réinitialise pas** :
- Fermer complètement le modal
- Vérifier `productToEdit === null`
- Voir : [Debugging](./GUIDE_TECHNIQUE_FORMULAIRES.md#debugging)

---

## 🔗 Liens utiles

- [Documentation complète](./FORMULAIRES_PRODUITS.md)
- [Guide d'utilisation](./GUIDE_UTILISATION_FORMULAIRES.md)
- [Guide technique](./GUIDE_TECHNIQUE_FORMULAIRES.md)

---

## 📝 Notes de version

### Version actuelle

**Formulaires disponibles** :
- ✅ Vêtements (tailles par couleur)
- ✅ Chaussures (pointures par couleur)
- ✅ Autres (attributs flexibles)

**Fonctionnalités** :
- ✅ Création de produits
- ✅ Modification de produits
- ✅ Upload d'images
- ✅ Brouillon automatique
- ✅ Validation complète
- ✅ Mode responsive
- ✅ Personnalisations client

---

## 🤝 Contribution

Pour ajouter un nouveau type de formulaire ou améliorer l'existant, consulter la [Checklist d'intégration](./GUIDE_TECHNIQUE_FORMULAIRES.md#checklist-dintégration) dans le guide technique.

---

## 📧 Contact

Pour toute question ou suggestion concernant les formulaires de produits, consulter d'abord la documentation appropriée ci-dessus.

---

**Dernière mise à jour** : Février 2026
