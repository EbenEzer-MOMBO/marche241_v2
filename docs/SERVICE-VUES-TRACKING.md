# Service de Tracking des Vues

Ce service gère toutes les interactions avec l'API de tracking des vues pour les boutiques et produits.

## 📁 Fichiers

- **`src/lib/services/vues.ts`** : Service principal
- **`src/hooks/useVues.ts`** : Hooks React pour faciliter l'utilisation
- **`src/components/admin/VuesStatsDetail.tsx`** : Composant d'affichage détaillé
- **`src/components/admin/dashboard/TopViewedProducts.tsx`** : Diagramme en barres horizontales

---

## 🔧 Service Principal (`vues.ts`)

### Interfaces

```typescript
interface StatistiquesVuesBoutique {
  nombre_vues_total: number;
  vues_totales: number;
  vues_aujourd_hui: number;
  vues_7_jours: number;
  vues_30_jours: number;
}

interface StatistiquesVuesProduit {
  nombre_vues_total: number;
  vues_totales: number;
  vues_aujourd_hui: number;
  vues_7_jours: number;
  vues_30_jours: number;
}

interface ProduitPopulaire {
  id: number;
  nom: string;
  nombre_vues: number;
  image_principale?: string;
}
```

### Fonctions Disponibles

#### 1. `getStatistiquesVuesBoutique()`

Récupère les statistiques détaillées d'une boutique.

```typescript
const stats = await getStatistiquesVuesBoutique(57);
console.log(stats.statistiques.vues_30_jours); // 890
```

#### 2. `getStatistiquesVuesProduit()`

Récupère les statistiques détaillées d'un produit.

```typescript
const stats = await getStatistiquesVuesProduit(123);
console.log(stats.statistiques.vues_aujourd_hui); // 12
```

#### 3. `getVuesBoutiqueDashboard()`

Version simplifiée pour le dashboard (uniquement vues du mois et total).

```typescript
const vues = await getVuesBoutiqueDashboard(57);
console.log(vues.vues_mois); // 890
console.log(vues.vues_total); // 1250
```

#### 4. `getProduitsLesPlusVus()`

Récupère les produits les plus vus d'une boutique.

```typescript
const topProducts = await getProduitsLesPlusVus(57, 5);
// Retourne les 5 produits les plus vus
```

#### 5. `getStatistiquesVuesProduits()`

Récupère les stats de plusieurs produits en parallèle.

```typescript
const statsMap = await getStatistiquesVuesProduits([1, 2, 3, 4, 5]);
const statsProduit1 = statsMap.get(1);
```

---

## ⚛️ Hooks React (`useVues.ts`)

### `useStatistiquesVuesBoutique()`

Hook pour récupérer les stats d'une boutique avec gestion du loading et des erreurs.

```typescript
const { stats, isLoading, error, refresh } = useStatistiquesVuesBoutique(57);

if (isLoading) return <Loader />;
if (error) return <Error message={error} />;

return (
  <div>
    <p>Vues du mois: {stats?.vues_30_jours}</p>
    <button onClick={refresh}>Rafraîchir</button>
  </div>
);
```

### `useStatistiquesVuesProduit()`

Hook pour récupérer les stats d'un produit.

```typescript
const { stats, isLoading, error, refresh } = useStatistiquesVuesProduit(123);
```

---

## 🎨 Composants

### 1. `VuesStatsDetail`

Composant pour afficher les statistiques détaillées avec 4 cartes colorées.

**Props:**
- `stats`: StatistiquesVuesBoutique - Statistiques à afficher
- `nomBoutique?`: string - Nom de la boutique (optionnel)

**Exemple:**
```tsx
<VuesStatsDetail 
  stats={stats} 
  nomBoutique="Ma Super Boutique" 
/>
```

**Affichage:**
- 📅 Aujourd'hui (bleu)
- 📈 7 jours (vert)
- 📊 30 jours (violet)
- 👁️ Total (amber)

---

### 2. `TopViewedProducts`

Diagramme en barres horizontales des produits les plus vus.

**Props:**
- `products`: ProduitPopulaire[] - Liste des produits
- `boutiqueSlug`: string - Slug de la boutique
- `onNavigate`: (path: string) => void - Callback de navigation

**Exemple:**
```tsx
<TopViewedProducts
  products={topViewedProducts}
  boutiqueSlug="ma-boutique"
  onNavigate={(path) => router.push(path)}
/>
```

**Fonctionnalités:**
- ✅ Barres de progression avec dégradés de couleur
- ✅ Badges de classement (🥇 or, 🥈 argent, 🥉 bronze)
- ✅ Animation de brillance sur les barres
- ✅ Clic pour naviguer vers le produit
- ✅ État vide élégant
- ✅ Pourcentages relatifs (barre la plus longue = 100%)

**Couleurs par rang:**
1. 🥇 Or : Indigo (gradient indigo-500 → indigo-600)
2. 🥈 Argent : Bleu (gradient blue-500 → blue-600)
3. 🥉 Bronze : Violet (gradient purple-500 → purple-600)
4. Autres : Gris (gradient gray-400 → gray-500)

---

## 🔄 Intégration dans le Dashboard

Le service est déjà intégré dans `statistiques.ts` :

```typescript
// Dans getStatistiquesDashboard()
const vuesData = await getVuesBoutiqueDashboard(boutiqueId);
return {
  // ... autres stats
  vues_mois: vuesData.vues_mois,
  vues_total: vuesData.vues_total,
};
```

---

## 📊 Affichage dans le Dashboard

### Grid des Statistiques

```tsx
<StatsCard
  icon={Eye}
  iconColor="indigo"
  label="Vues (mois)"
  value={statistiques?.vues_mois || 0}
  subtitle="Ce mois-ci"
/>

<StatsCard
  icon={BarChart3}
  iconColor="amber"
  label="Vues (total)"
  value={statistiques?.vues_total || 0}
  subtitle="Depuis création"
/>
```

### Section Produits

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Produits récents */}
  <RecentProducts ... />
  
  {/* Produits les plus vus */}
  <TopViewedProducts
    products={topViewedProducts}
    boutiqueSlug={boutique.slug}
    onNavigate={(path) => router.push(path)}
  />
</div>
```

---

## 🚀 Backend - Routes à Implémenter

### Route Existante ✅

```
GET /api/v1/boutiques/:id/stats
```
**Déjà implémentée** - Retourne les stats complètes d'une boutique.

---

### Nouvelle Route à Créer ⚠️

```
GET /api/v1/boutiques/:id/produits/top-vues?limite=5
```

**Description:** Retourne les produits les plus vus d'une boutique, triés par `nombre_vues DESC`.

**Paramètres:**
- `id` (path) : ID de la boutique
- `limite` (query) : Nombre de produits à retourner (défaut: 5)

**Réponse:**
```json
{
  "success": true,
  "produits": [
    {
      "id": 123,
      "nom": "iPhone 15 Pro",
      "nombre_vues": 350,
      "image_principale": "https://..."
    },
    {
      "id": 456,
      "nom": "MacBook Pro",
      "nombre_vues": 280,
      "image_principale": "https://..."
    }
  ]
}
```

**Requête SQL:**
```sql
SELECT 
  p.id,
  p.nom,
  p.nombre_vues,
  p.image_principale
FROM produits p
WHERE p.boutique_id = $1 
  AND p.statut = 'actif'
ORDER BY p.nombre_vues DESC
LIMIT $2;
```

---

## 💡 Gestion des Erreurs

Toutes les fonctions incluent une gestion d'erreurs robuste :

```typescript
try {
  const stats = await getStatistiquesVuesBoutique(57);
} catch (error) {
  // Retourne des valeurs par défaut (0) au lieu de crasher
  console.error('Erreur:', error.message);
}
```

**Valeurs par défaut en cas d'erreur:**
- `vues_mois`: 0
- `vues_total`: 0
- `topViewedProducts`: []

---

## 🎯 Cas d'Usage

### 1. Dashboard Vendeur
```tsx
// Afficher les stats dans les cartes
const { vues_mois, vues_total } = statistiques;
```

### 2. Page Détails Boutique
```tsx
const { stats, isLoading } = useStatistiquesVuesBoutique(boutiqueId);
return <VuesStatsDetail stats={stats} />;
```

### 3. Liste de Produits avec Stats
```tsx
const statsMap = await getStatistiquesVuesProduits([1, 2, 3]);
products.forEach(p => {
  const vues = statsMap.get(p.id)?.nombre_vues_total || 0;
  console.log(`${p.nom}: ${vues} vues`);
});
```

### 4. Top Produits Populaires
```tsx
const topProducts = await getProduitsLesPlusVus(boutiqueId, 10);
```

---

## 📈 Performance

- ✅ Requêtes en parallèle pour les stats de plusieurs produits
- ✅ Gestion du cache côté backend (recommandé : Redis, 5 min)
- ✅ Fallback gracieux en cas d'erreur
- ✅ États de chargement et vides élégants

---

## 🔒 Sécurité

- ✅ Token JWT requis pour toutes les routes
- ✅ Vérification de propriété (vendeur = propriétaire boutique)
- ✅ Validation des paramètres
- ✅ Protection contre les injections SQL

---

## 📝 Notes

- Les vues sont déduplicées par **IP + jour**
- Les IPs privées (localhost, 192.168.x.x) sont ignorées
- Les données de tracking sont conservées **90 jours**
- Le tracking est **asynchrone** (n'impacte pas les performances)

---

## ✅ Checklist d'Implémentation

- [x] Service frontend créé (`vues.ts`)
- [x] Hooks React créés (`useVues.ts`)
- [x] Composant détaillé créé (`VuesStatsDetail.tsx`)
- [x] Composant Top Produits créé (`TopViewedProducts.tsx`)
- [x] Intégration dans le dashboard
- [x] Animation CSS (effet de brillance)
- [ ] Route backend `/boutiques/:id/produits/top-vues` à implémenter
- [ ] Tests unitaires
- [ ] Documentation API complète

---

Le service est **prêt à l'emploi** côté frontend. Il suffit d'implémenter la route backend pour les produits les plus vus ! 🚀
