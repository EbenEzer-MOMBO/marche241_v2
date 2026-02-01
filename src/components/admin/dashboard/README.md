# Composants du Dashboard Admin

Ce dossier contient les composants réutilisables du tableau de bord administrateur.

## Composants

### 1. `StatsCard`

Carte de statistique avec icône, label et valeur.

**Props :**
- `icon`: LucideIcon - Icône à afficher
- `iconColor`: 'blue' | 'green' | 'purple' | 'orange' | 'amber' | 'indigo' - Couleur de l'icône
- `label`: string - Label de la statistique
- `value`: number | string - Valeur à afficher
- `subtitle?`: string - Texte optionnel sous la valeur

**Exemple :**
```tsx
<StatsCard
  icon={Package}
  iconColor="blue"
  label="Produits"
  value={42}
  subtitle="12 actifs"
/>
```

---

### 2. `PeriodSelector`

Sélecteur de période (7, 30, 90 jours) pour les statistiques.

**Props :**
- `periode`: number - Période actuellement sélectionnée
- `onChange`: (periode: number) => void - Callback lors du changement

**Exemple :**
```tsx
<PeriodSelector 
  periode={30} 
  onChange={(p) => setPeriode(p)} 
/>
```

---

### 3. `ConfigAlert`

Alerte de configuration avec appel à l'action.

**Props :**
- `type`: 'products' | 'shipping' - Type d'alerte
- `onAction`: () => void - Action à exécuter au clic du bouton

**Exemple :**
```tsx
<ConfigAlert 
  type="products" 
  onAction={() => router.push('/admin/boutique/products')} 
/>
```

**Types disponibles :**
- `products`: Alerte pour absence de produits (amber)
- `shipping`: Alerte pour absence de zones de livraison (bleu)

---

### 4. `QuickActions`

Bloc d'actions rapides avec 3 boutons.

**Props :**
- `boutiqueSlug`: string - Slug de la boutique
- `onNavigate`: (path: string) => void - Callback de navigation

**Exemple :**
```tsx
<QuickActions 
  boutiqueSlug="ma-boutique" 
  onNavigate={(path) => router.push(path)} 
/>
```

**Actions incluses :**
- Gérer les produits
- Voir les commandes
- Gérer les catégories

---

### 5. `RecentProducts`

Liste des produits récents avec état vide.

**Props :**
- `products`: Produit[] - Liste des produits
- `boutiqueSlug`: string - Slug de la boutique
- `onNavigate`: (path: string) => void - Callback de navigation

**Type Produit :**
```tsx
interface Produit {
  id: number;
  nom: string;
  prix: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  image_principale?: string;
}
```

**Exemple :**
```tsx
<RecentProducts
  products={recentProducts}
  boutiqueSlug="ma-boutique"
  onNavigate={(path) => router.push(path)}
/>
```

---

## Utilisation dans le Dashboard

```tsx
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { PeriodSelector } from '@/components/admin/dashboard/PeriodSelector';
import { ConfigAlert } from '@/components/admin/dashboard/ConfigAlert';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { RecentProducts } from '@/components/admin/dashboard/RecentProducts';
import { Package, ShoppingCart } from 'lucide-react';

export default function Dashboard() {
  const [periode, setPeriode] = useState(30);
  
  return (
    <div>
      {/* Sélecteur de période */}
      <PeriodSelector periode={periode} onChange={setPeriode} />
      
      {/* Alertes de configuration */}
      <ConfigAlert type="products" onAction={handleAddProduct} />
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          icon={Package}
          iconColor="blue"
          label="Produits"
          value={42}
          subtitle="12 actifs"
        />
        <StatsCard
          icon={ShoppingCart}
          iconColor="green"
          label="Commandes"
          value={15}
        />
      </div>
      
      {/* Actions rapides */}
      <QuickActions 
        boutiqueSlug="ma-boutique" 
        onNavigate={router.push} 
      />
      
      {/* Produits récents */}
      <RecentProducts
        products={products}
        boutiqueSlug="ma-boutique"
        onNavigate={router.push}
      />
    </div>
  );
}
```

---

## Avantages de cette Architecture

1. **Réutilisabilité** : Composants facilement réutilisables dans d'autres pages
2. **Maintenabilité** : Code organisé et facile à modifier
3. **Testabilité** : Composants isolés faciles à tester
4. **Lisibilité** : Code principal du dashboard plus léger et lisible
5. **Cohérence** : Design system unifié pour toutes les statistiques

---

## Futures Améliorations

- [ ] Ajouter des tests unitaires pour chaque composant
- [ ] Implémenter Storybook pour la documentation visuelle
- [ ] Ajouter des animations de transition
- [ ] Support du mode sombre
- [ ] Variants supplémentaires pour `StatsCard` (avec graphique inline, tendance, etc.)
