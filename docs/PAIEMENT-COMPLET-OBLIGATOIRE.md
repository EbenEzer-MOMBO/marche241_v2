# Configuration des Modes de Paiement par Boutique

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux boutiques de contrôler les options de paiement disponibles pour leurs clients :
- **Mode Libre** : Le client peut choisir entre paiement complet ou paiement des frais de livraison uniquement
- **Mode Restreint** : Seul le paiement des frais de livraison est disponible (paiement à la livraison obligatoire)

---

## 🔧 Modifications Apportées

### 1. **Schéma de Base de Données**

**Nouvelle colonne ajoutée :**
```sql
ALTER TABLE boutiques 
ADD COLUMN is_full_payment_activated BOOLEAN DEFAULT FALSE;
```

**Description :**
- `is_full_payment_activated` : Boolean
  - `true` : **Mode Libre** - Le client peut choisir entre paiement complet ou paiement des frais uniquement
  - `false` : **Mode Restreint** - Seul le paiement des frais de livraison est disponible (checkbox cochée et non modifiable)

---

### 2. **Types TypeScript**

#### **`src/lib/database-types.ts`**

```typescript
export interface Boutique {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  vendeur_id: number;
  logo?: string;
  banniere?: string;
  couleur_primaire: string;
  couleur_secondaire: string;
  adresse?: string;
  telephone?: string;
  is_full_payment_activated: boolean; // ✨ NOUVEAU
  statut: StatutBoutique;
  date_creation: Date;
  date_modification: Date;
  nombre_produits: number;
  note_moyenne: number;
  nombre_avis: number;
  
  vendeur?: Vendeur;
}
```

---

#### **`src/lib/services/auth.ts`**

**Interface `BoutiqueData` :**
```typescript
export interface BoutiqueData {
  id: number;
  nom: string;
  slug: string;
  description: string;
  vendeur_id: number;
  logo?: string;
  banniere?: string;
  couleur_primaire?: string;
  couleur_secondaire?: string;
  adresse?: string;
  telephone?: string;
  is_full_payment_activated?: boolean; // ✨ NOUVEAU
  statut: 'active' | 'inactive' | 'suspended';
  date_creation: string;
  date_modification: string;
  nombre_produits?: number;
  note_moyenne?: number;
  nombre_avis?: number;
}
```

**Interface `ModifierBoutiqueData` :**
```typescript
export interface ModifierBoutiqueData {
  nom?: string;
  slug?: string;
  description?: string;
  logo?: string;
  banniere?: string;
  couleur_primaire?: string;
  couleur_secondaire?: string;
  adresse?: string;
  telephone?: string;
  is_full_payment_activated?: boolean; // ✨ NOUVEAU
}
```

---

### 3. **Page de Commande**

#### **`src/app/[boutique]/commande/page.tsx`**

**Modification :**
```typescript
<OrderSummary 
  boutiqueConfig={boutiqueConfig} 
  boutiqueId={boutiqueData.id} 
  boutiqueTelephone={boutiqueData.telephone} 
  boutiqueData={boutiqueData} // ✨ NOUVEAU : Données complètes de la boutique
/>
```

---

### 4. **Composant OrderSummary**

#### **`src/components/OrderSummary.tsx`**

**Props modifiées :**
```typescript
interface OrderSummaryProps {
  boutiqueConfig: BoutiqueConfig;
  boutiqueId: number;
  boutiqueTelephone?: string;
  boutiqueData: any; // ✨ NOUVEAU : Données complètes de la boutique
}
```

**Logique ajoutée :**
```typescript
export function OrderSummary({ 
  boutiqueConfig, 
  boutiqueId, 
  boutiqueTelephone, 
  boutiqueData 
}: OrderSummaryProps) {
  // Si is_full_payment_activated = false, forcer le paiement à la livraison uniquement (checkbox cochée et non modifiable)
  // Si is_full_payment_activated = true, l'utilisateur peut choisir librement
  const isFullPaymentActivated = boutiqueData?.is_full_payment_activated === true;
  const [payOnDelivery, setPayOnDelivery] = useState(!isFullPaymentActivated); // Inversé : true si mode restreint
  
  // ... reste du code
}
```

**UI modifiée :**
```typescript
{/* Option paiement à la livraison */}
<div className="border-t border-b py-4 border-gray-200">
  <label className={`flex items-center ${
    !isFullPaymentActivated || deliveryFee === 0 
      ? 'cursor-not-allowed opacity-50' 
      : 'cursor-pointer'
  }`}>
    <input
      type="checkbox"
      checked={payOnDelivery}
      onChange={(e) => isFullPaymentActivated && setPayOnDelivery(e.target.checked)}
      disabled={!isFullPaymentActivated || deliveryFee === 0}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
    />
    <span className="ml-3 text-sm font-medium text-gray-700">
      Je paie à la livraison
    </span>
  </label>
  
  {/* Message pour mode restreint (frais de livraison uniquement) */}
  {!isFullPaymentActivated && (
    <p className="text-xs text-amber-600 mt-2 ml-7 font-medium">
      Seul le paiement des frais de livraison est disponible pour cette boutique
    </p>
  )}
  
  {/* Message pour livraison gratuite (mode libre) */}
  {isFullPaymentActivated && deliveryFee === 0 && deliveryAddress.city && (
    <p className="text-xs text-gray-500 mt-2 ml-7">
      Non disponible pour les livraisons gratuites
    </p>
  )}
  
  {/* Message paiement partiel (mode libre) */}
  {isFullPaymentActivated && payOnDelivery && deliveryFee > 0 && (
    <p className="text-xs text-gray-500 mt-2 ml-7">
      Vous payez les frais de livraison + frais de transaction maintenant. 
      Le reste sera payé à la réception.
    </p>
  )}
</div>
```

---

## 🎯 Comportement

### **Scénario 1 : `is_full_payment_activated = true` (Mode Libre)**

✅ **Choix complet pour le client :**
- La checkbox "Je paie à la livraison" est **disponible et modifiable**
- L'utilisateur peut choisir librement entre :
  - **Paiement complet** (checkbox décochée) : Payer le total maintenant
  - **Paiement à la livraison** (checkbox cochée) : Payer frais de livraison + frais de transaction maintenant, le reste à la livraison

---

### **Scénario 2 : `is_full_payment_activated = false` (Mode Restreint)**

🔒 **Paiement des frais uniquement :**
- La checkbox "Je paie à la livraison" est **cochée automatiquement** et **non modifiable**
- Un message s'affiche : 
  > ⚠️ Seul le paiement des frais de livraison est disponible pour cette boutique
- L'utilisateur **doit** payer uniquement les frais de livraison + frais de transaction
- Le reste sera payé à la livraison
- Le style visuel indique clairement que l'option est verrouillée (opacité réduite, curseur not-allowed)

---

## 📸 Aperçu Visuel

### **Mode Libre (`is_full_payment_activated = true`)**
```
☐ Je paie à la livraison (checkbox active, cliquable)
   Vous payez les frais de livraison + frais de transaction maintenant. 
   Le reste sera payé à la réception.
```

### **Mode Restreint (`is_full_payment_activated = false`)**
```
☑ Je paie à la livraison (checkbox cochée, désactivée, grisée)
   ⚠️ Seul le paiement des frais de livraison est disponible pour cette boutique
```

---

### 5. **Interface Admin - Paramètres**

#### **`src/components/admin/settings/PaymentModeSection.tsx`**

**Nouveau composant créé :**
```typescript
interface PaymentModeSectionProps {
  isFullPaymentActivated: boolean;
  onChange: (value: boolean) => void;
}

export const PaymentModeSection: React.FC<PaymentModeSectionProps> = ({
  isFullPaymentActivated,
  onChange,
}) => {
  // Composant avec deux options radio :
  // 1. Mode Libre (recommandé) - isFullPaymentActivated = true
  // 2. Mode Restreint - isFullPaymentActivated = false
}
```

**Caractéristiques :**
- 🎨 Interface visuelle moderne avec radio buttons
- 📝 Descriptions claires de chaque mode
- 💡 Conseils et recommandations
- ✅ Indicateurs visuels (couleurs vert/ambre)
- 📋 Liste des avantages de chaque mode

**Intégration dans `src/app/admin/[boutique]/settings/page.tsx` :**
```typescript
// État initial
const [boutiqueData, setBoutiqueData] = useState({
  // ... autres champs
  is_full_payment_activated: true // Valeur par défaut
});

// Chargement des données
setBoutiqueData({
  // ... autres champs
  is_full_payment_activated: boutiqueData.is_full_payment_activated ?? true
});

// Composant dans le JSX
<PaymentModeSection
  isFullPaymentActivated={boutiqueData.is_full_payment_activated ?? true}
  onChange={(value) => setBoutiqueData({ 
    ...boutiqueData, 
    is_full_payment_activated: value 
  })}
/>

// Sauvegarde
await modifierBoutique(boutique.id, {
  // ... autres champs
  is_full_payment_activated: boutiqueData.is_full_payment_activated
});
```

**Position dans les paramètres :**
- ✅ Après la section "Informations de la boutique"
- ✅ Avant la section "Apparence"

---

## 🛠️ Configuration Backend

### **Pour activer le Mode Libre (choix complet) :**

**API Endpoint :**
```http
PUT /api/v1/boutiques/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "is_full_payment_activated": true
}
```

**Exemple SQL :**
```sql
UPDATE boutiques 
SET is_full_payment_activated = true 
WHERE id = 1;
```

---

### **Pour activer le Mode Restreint (frais uniquement) :**

**API Endpoint :**
```http
PUT /api/v1/boutiques/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "is_full_payment_activated": false
}
```

**Exemple SQL :**
```sql
UPDATE boutiques 
SET is_full_payment_activated = false 
WHERE id = 1;
```

---

## ✅ Checklist Implémentation

- [x] Ajout de la colonne `is_full_payment_activated` dans `Boutique` interface (database-types.ts)
- [x] Ajout dans `BoutiqueData` interface (auth.ts)
- [x] Ajout dans `ModifierBoutiqueData` interface (auth.ts)
- [x] Passage de `boutiqueData` au composant `OrderSummary`
- [x] Logique de désactivation de la checkbox selon `isFullPaymentActivated`
- [x] Message d'information utilisateur
- [x] Styles UI adaptés (désactivé, opacité, curseur)
- [x] Création du composant `PaymentModeSection`
- [x] Intégration dans l'interface admin (`settings/page.tsx`)
- [x] Sauvegarde de la valeur dans le backend
- [ ] Migration SQL backend (à faire par l'équipe backend)
- [ ] Tests fonctionnels

---

## 🔄 Prochaines Étapes

### **Backend :**
1. Créer la migration SQL pour ajouter la colonne
2. Mettre à jour les endpoints API pour accepter `is_full_payment_activated`
3. Valider que la valeur par défaut est `false`

### **Frontend Admin :**
1. ✅ Toggle ajouté dans les paramètres de la boutique (`PaymentModeSection`)
2. ✅ Le vendeur peut activer/désactiver cette option
3. ✅ Explication claire de l'impact avec descriptions et conseils

---

## 📝 Notes Importantes

- **Valeur par défaut recommandée :** `true` (Mode Libre - choix complet pour le client)
- **Mode Restreint (`false`)** : Utile pour les boutiques qui veulent encourager les paiements à la livraison
- **Rétrocompatibilité :** ⚠️ Définir une valeur par défaut appropriée lors de la migration
- **Impact UX :** Message clair pour l'utilisateur selon le mode activé
- **Validation :** La logique côté client gère automatiquement l'état de la checkbox
- **Comportement automatique :** En mode restreint, la checkbox se coche automatiquement lors de la sélection d'une commune avec frais > 0

---

**Date de création :** 2026-02-03  
**Version :** 1.0.0  
**Auteur :** Système de développement
