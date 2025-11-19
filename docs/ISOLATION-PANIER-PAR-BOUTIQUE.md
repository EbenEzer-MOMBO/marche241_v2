# Isolation du Panier par Boutique

## 📋 Contexte

Avant cette modification, tous les paniers partageaient la même session globale `marche241_session_id`. Cela signifiait qu'un utilisateur naviguant entre différentes boutiques voyait tous ses articles mélangés dans un seul panier, indépendamment de la boutique d'origine.

## 🎯 Objectif

Isoler les paniers par boutique afin que chaque boutique ait son propre panier indépendant. Un utilisateur peut maintenant avoir des produits dans le panier de la Boutique A ET des produits différents dans le panier de la Boutique B, sans qu'ils se mélangent.

## 🔧 Modifications Apportées

### 1. **Service Session** (`src/lib/services/session.ts`)

Toutes les fonctions de gestion de session acceptent maintenant un paramètre optionnel `boutiqueId` :

#### **`getOrCreateSessionId(boutiqueId?: number)`**
- **Avant** : `marche241_session_id` (global)
- **Après** : `marche241_session_id_${boutiqueId}` (spécifique à chaque boutique)

```typescript
// Sans boutiqueId : session globale (rétrocompatibilité)
const sessionId = getOrCreateSessionId();
// → "marche241_session_id"

// Avec boutiqueId : session isolée par boutique
const sessionId = getOrCreateSessionId(123);
// → "marche241_session_id_123"
```

#### **`clearSession(boutiqueId?: number)`**
Vide la session d'une boutique spécifique ou la session globale.

#### **`isSessionValid(boutiqueId?: number)`**
Vérifie la validité d'une session spécifique ou globale.

### 2. **Service Panier** (`src/lib/services/panier.ts`)

Les fonctions du service panier passent maintenant le `boutiqueId` aux fonctions de session :

#### **`ajouterAuPanier(boutiqueId, produitId, quantite, variants)`**
```typescript
// Obtient une session spécifique à cette boutique
const sessionId = getOrCreateSessionId(boutiqueId);
```

#### **`getPanier(boutiqueId?: number)`**
```typescript
// Récupère le panier pour une boutique spécifique
const sessionId = getOrCreateSessionId(boutiqueId);
```

#### **`viderPanier(boutiqueId?: number)`**
```typescript
// Vide uniquement le panier de la boutique spécifiée
const sessionId = getOrCreateSessionId(boutiqueId);
```

### 3. **Hook usePanier** (`src/hooks/usePanier.ts`)

Le hook accepte maintenant un paramètre optionnel `boutiqueId` :

```typescript
export function usePanier(boutiqueId?: number): UsePanierResult {
  // ...
  const response = await getPanier(boutiqueId);
  // ...
}
```

### 4. **Composants Mis à Jour**

Tous les composants utilisant `usePanier` ont été mis à jour pour passer le `boutiqueId` :

#### **Header** (`src/components/Header.tsx`)
```typescript
const { boutique } = useBoutique(boutiqueName);
const { totalItems, rafraichir } = usePanier(boutique?.id);
```

#### **CartSidebar** (`src/components/CartSidebar.tsx`)
```typescript
const { boutique } = useBoutique(boutiqueName);
const { panier, totalItems, ... } = usePanier(boutique?.id);
```

#### **FloatingCartButton** (`src/components/FloatingCartButton.tsx`)
```typescript
const { boutique } = useBoutique(boutiqueName);
const { panier, totalItems, ... } = usePanier(boutique?.id);
```

#### **OrderSummary** (`src/components/OrderSummary.tsx`)
```typescript
// Reçoit déjà boutiqueId en prop
const { panier, totalItems, ... } = usePanier(boutiqueId);
```

## 📦 Structure localStorage

### Avant
```
localStorage:
  - marche241_session_id: "session_abc123"
  - marche241_session_expiry: "2025-12-19T10:00:00Z"
```

### Après
```
localStorage:
  - marche241_session_id_1: "session_abc123"  // Boutique ID 1
  - marche241_session_expiry_1: "2025-12-19T10:00:00Z"
  - marche241_session_id_2: "session_def456"  // Boutique ID 2
  - marche241_session_expiry_2: "2025-12-19T10:00:00Z"
```

## 🔄 Flux Utilisateur

### Scénario : Navigation entre Boutiques

1. **Utilisateur visite Boutique A (ID: 1)**
   - Session créée : `marche241_session_id_1`
   - Ajoute 2 produits au panier

2. **Utilisateur visite Boutique B (ID: 2)**
   - Session créée : `marche241_session_id_2`
   - Ajoute 3 produits au panier
   - ✅ Le panier de la Boutique A reste intact

3. **Utilisateur retourne à Boutique A**
   - Utilise : `marche241_session_id_1`
   - ✅ Retrouve ses 2 produits originaux

## 🎯 Avantages

✅ **Isolation complète** : Chaque boutique a son propre panier
✅ **Expérience utilisateur** : Pas de mélange de produits de différentes boutiques
✅ **Rétrocompatibilité** : Les fonctions acceptent `boutiqueId` optionnel
✅ **Scalabilité** : Facile d'ajouter de nouvelles boutiques
✅ **Maintenance** : Code clair et bien structuré

## ⚠️ Points d'Attention

### Expiration des Sessions
- Chaque session de boutique expire indépendamment (1 mois)
- Une session expirée est automatiquement recréée

### Nettoyage localStorage
- Les anciennes sessions ne sont pas automatiquement supprimées
- Considérer l'ajout d'une fonction de nettoyage périodique

### Migration des Données
- Les paniers existants avec l'ancienne session globale ne sont pas automatiquement migrés
- Les utilisateurs devront re-ajouter leurs produits (impact minimal car durée de session courte)

## 🧪 Tests

### Test Manuel

1. Visiter Boutique A, ajouter un produit
2. Vérifier localStorage : `marche241_session_id_1` existe
3. Visiter Boutique B, ajouter un produit différent
4. Vérifier localStorage : `marche241_session_id_2` existe
5. Retourner à Boutique A
6. ✅ Vérifier que le produit de Boutique A est toujours là

### Code Test
```typescript
// Test isolation
const sessionA = getOrCreateSessionId(1);
const sessionB = getOrCreateSessionId(2);
console.assert(sessionA !== sessionB, "Sessions should be different");

// Test rétrocompatibilité
const sessionGlobal = getOrCreateSessionId();
console.assert(sessionGlobal, "Global session should work");
```

## 📝 Conclusion

Cette modification apporte une véritable isolation des paniers par boutique, améliorant considérablement l'expérience utilisateur sur une plateforme multi-boutiques. Chaque boutique peut maintenant gérer son panier indépendamment, évitant toute confusion pour l'utilisateur final.

