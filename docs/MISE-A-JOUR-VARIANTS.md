# Mise à Jour : Gestion des Variants avec Quantités

## Résumé des Modifications

Le système de gestion des produits a été mis à jour pour gérer les quantités au niveau de chaque option de variant, avec la contrainte d'**un seul variant par produit**.

## Fichiers Modifiés

### 1. **`src/components/admin/ProduitModal.tsx`**
#### Changements :
- Modification de la structure `variants` pour inclure un tableau `quantites`
- Suppression du champ de quantité globale
- Ajout d'un `useEffect` pour calculer automatiquement le stock total
- Ajout de la fonction `updateVariantQuantity()` pour gérer les modifications
- Interface utilisateur mise à jour :
  - Formulaire d'ajout affiché uniquement si aucun variant n'existe
  - Champs de quantité pour chaque option du variant
  - Affichage du total par variant et du stock global
  - Bouton de suppression pour retirer le variant

### 2. **`src/app/admin/[boutique]/products/page.tsx`**
#### Changements :
- Colonne "Stock" (Desktop) :
  - Affichage du stock total en haut
  - Liste détaillée des quantités par option en dessous
- Version Mobile :
  - Stock total affiché
  - Badges pour chaque option avec sa quantité

### 3. **`src/components/ProductDetail.tsx`**
#### Changements :
- Affichage des variants avec quantités disponibles
- Grille responsive (2 colonnes mobile, 3 colonnes desktop)
- Désactivation visuelle des options en rupture
- Affichage de la quantité disponible pour chaque option
- Limitation de la sélection de quantité basée sur le variant choisi
- Réinitialisation automatique de la quantité si elle dépasse le stock disponible du variant sélectionné
- Fallback pour l'ancienne structure de variants (compatibilité)

### 4. **`docs/VARIANTS-QUANTITES.md`**
#### Changements :
- Documentation complète du nouveau système
- Explication de la contrainte d'un seul variant
- Exemples d'utilisation
- Guide de migration

## Nouvelle Structure de Données

### Format Variant
```typescript
interface Variant {
  nom: string;           // Ex: "Type", "Taille", "Couleur"
  options: string[];     // Ex: ["A", "B", "C", "D"]
  quantites: number[];   // Ex: [8, 8, 4, 1]
}
```

### Exemple JSON
```json
{
  "variants": [
    {
      "nom": "Type",
      "options": ["A", "B", "C", "D"],
      "quantites": [8, 8, 4, 1]
    }
  ],
  "en_stock": 21,
  "quantite_stock": 21
}
```

## Comportement du Système

### 1. Modal de Produit (Admin)
- ✅ Un seul variant peut être ajouté
- ✅ Chaque option a son propre champ de quantité
- ✅ Le stock total se calcule automatiquement
- ✅ Le formulaire d'ajout disparaît après création du variant
- ✅ Possibilité de supprimer le variant pour en créer un nouveau

### 2. Liste des Produits (Admin)
- ✅ Affichage du stock total
- ✅ Détail des quantités par option (Desktop)
- ✅ Badges avec quantités (Mobile)

### 3. Page de Détail du Produit (Client)
- ✅ Grille d'options avec quantités disponibles
- ✅ Options épuisées désactivées visuellement
- ✅ Limitation de la quantité selon l'option sélectionnée
- ✅ Réinitialisation automatique si quantité > stock disponible

## Avantages

1. **Gestion Précise** : Suivi exact des stocks pour chaque option
2. **Expérience Utilisateur** : Affichage clair des disponibilités
3. **Prévention des Erreurs** : Impossible de commander plus que le stock disponible
4. **Automatisation** : Calcul automatique du stock total
5. **Simplicité** : Un seul variant par produit facilite la gestion

## Cas d'Usage

### Produit avec Variants
```
Nom: T-Shirt Premium
Variant: Taille
- S: 10 unités
- M: 15 unités
- L: 12 unités
- XL: 8 unités

Stock total: 45 unités
```

### Produit Simple (sans variants)
```
Nom: Casquette Classique
Variants: []
Stock: 0 (ou défini manuellement si besoin)
```

## Migration

### Pour les Produits Existants
Le système détecte automatiquement l'ancienne structure et :
1. Initialise le tableau `quantites` avec des 0 si absent
2. Affiche un fallback pour les variants sans quantités
3. Permet de mettre à jour progressivement les produits

### Recommandations
1. Mettre à jour les produits un par un via l'interface admin
2. Définir les quantités pour chaque option
3. Vérifier que le stock total calculé est correct
4. Tester l'affichage côté client

## Limitations

- **Un seul variant par produit** : Pour gérer plusieurs dimensions (ex: taille ET couleur), vous devez :
  - Créer des produits séparés, ou
  - Utiliser des options combinées (ex: "S-Rouge", "M-Bleu")

## Support

Pour toute question ou problème, référez-vous à la documentation complète dans `docs/VARIANTS-QUANTITES.md`.

