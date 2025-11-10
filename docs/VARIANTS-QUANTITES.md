# Gestion des Quantités par Variant

## Vue d'ensemble

Le système de gestion des produits a été mis à jour pour gérer les quantités au niveau de chaque option de variant, plutôt qu'une quantité globale unique. Cela permet une gestion plus précise des stocks pour les produits avec un variant unique (type, couleur, taille, etc.).

**Important** : Le système ne permet qu'un seul variant par produit.

## Structure des Données

### Format JSON des Variants

```json
[
  {
    "nom": "Type",
    "options": ["A", "B", "C", "D"],
    "quantites": [8, 8, 4, 1]
  }
]
```

### Propriétés

- **`nom`** (string) : Le nom du variant (ex: "Couleur", "Taille", "Type")
- **`options`** (string[]) : La liste des options disponibles pour ce variant
- **`quantites`** (number[]) : Les quantités correspondantes pour chaque option (index pour index)

## Calcul du Stock Total

Le stock total est calculé automatiquement en additionnant toutes les quantités de tous les variants :

```typescript
const stockTotal = variants.reduce((total, variant) => {
  return total + variant.quantites.reduce((sum, qty) => sum + qty, 0);
}, 0);
```

### Exemple

Pour un produit avec un variant "Type" ayant :
- Type A : 8 unités
- Type B : 8 unités
- Type C : 4 unités
- Type D : 1 unité

**Stock total = 8 + 8 + 4 + 1 = 21 unités**

## Interface Utilisateur

### Modal de Produit

1. **Section Variants** : 
   - Formulaire pour ajouter un nouveau variant avec son nom et ses options
   - Chaque variant ajouté s'affiche avec des champs de saisie de quantité pour chaque option
   - Affichage du total par variant
   - Bouton de suppression pour chaque variant

2. **Section Prix et Statut** :
   - Champs de prix (normal et promo)
   - Sélecteur de statut (actif/inactif)
   - Affichage du stock total calculé (si des variants existent)

3. **Affichage du Stock Total** :
   - Dans la section variants : encadré vert avec le stock total
   - Dans la section prix : encadré bleu rappelant le stock calculé

### Validation

- Les quantités ne peuvent pas être négatives (minimum: 0)
- Chaque variant doit avoir au moins une option
- Les quantités sont initialisées à 0 lors de l'ajout d'un variant

## Flux de Données

### Création d'un Produit

1. Utilisateur ajoute un variant avec ses options
2. Le système initialise toutes les quantités à 0
3. Utilisateur saisit les quantités pour chaque option
4. Le stock total est calculé automatiquement
5. Les données sont envoyées à l'API avec la structure complète

### Modification d'un Produit

1. Le système charge le produit avec ses variants existants
2. Si un variant n'a pas de propriété `quantites`, elle est initialisée avec des 0
3. Utilisateur peut modifier les quantités, ajouter/supprimer des variants
4. Le stock total se met à jour en temps réel
5. Les modifications sont sauvegardées

## Cas d'Usage

### Produit de Type T-Shirt

```json
[
  {
    "nom": "Taille",
    "options": ["S", "M", "L", "XL"],
    "quantites": [10, 15, 12, 8]
  }
]
```

**Stock total = 10 + 15 + 12 + 8 = 45 unités**

**Note** : Un seul variant est autorisé par produit. Si vous avez besoin de gérer des combinaisons (taille ET couleur), créez des produits séparés ou utilisez des options combinées (ex: "S-Rouge", "M-Bleu", etc.).

### Produit Simple sans Variants

Si aucun variant n'est défini :
- `variants = []`
- `en_stock = 0`
- Le champ de stock total n'est pas affiché dans l'interface

## Points Importants

1. **Calcul Automatique** : Le stock total se calcule automatiquement, l'utilisateur ne peut pas le modifier directement
2. **Synchronisation** : Les changements de quantités se reflètent immédiatement dans l'affichage du stock total
3. **Flexibilité** : Un produit peut avoir plusieurs variants (ex: couleur ET taille)
4. **Saisie Simple** : Interface intuitive avec des champs numériques pour chaque option
5. **Validation** : Protection contre les valeurs négatives et les données invalides

## API Backend

### Format d'Envoi

```json
{
  "nom": "T-Shirt Premium",
  "prix": 15000,
  "en_stock": 21,
  "quantite_stock": 21,
  "variants": [
    {
      "nom": "Type",
      "options": ["A", "B", "C", "D"],
      "quantites": [8, 8, 4, 1]
    }
  ]
}
```

### Champs Importants

- `en_stock` et `quantite_stock` contiennent la même valeur (stock total calculé)
- `variants` contient le tableau complet avec les quantités
- Le backend peut utiliser ces données pour la gestion avancée des stocks

## Migration

Pour les produits existants sans structure de quantités par variant :
- Le système initialise automatiquement `quantites` avec des 0 pour chaque option
- L'utilisateur doit ensuite saisir les quantités réelles
- Le stock total sera recalculé lors de la sauvegarde

