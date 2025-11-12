# Flux de Paiement - Marché241

Ce document décrit les deux flux de paiement disponibles dans l'application.

## Vue d'ensemble

L'application supporte deux modes de paiement :

1. **Paiement complet immédiat** : Le client paie l'intégralité de la commande (produits + livraison + frais) avant l'expédition
2. **Paiement à la livraison** : Le client paie uniquement les frais de livraison maintenant, et le reste à la réception

---

## 🔄 Flux 1 : Paiement Complet Immédiat

### Étape 1 : Création de la commande

```http
POST /api/v1/commandes
```

```json
{
  "boutique_id": 1,
  "client_nom": "Jean Dupont",
  "client_telephone": "+24166123456",
  "client_adresse": "Quartier Batterie IV",
  "client_ville": "Libreville",
  "client_commune": "Akanda",
  "frais_livraison": 2500,
  "articles": [
    {
      "produit_id": 5,
      "nom_produit": "T-Shirt",
      "prix_unitaire": 22500,
      "quantite": 1,
      "sous_total": 22500
    }
  ]
}
```

**Réponse :**

```json
{
  "success": true,
  "commande": {
    "id": 1,
    "numero_commande": "CMD-20250112-0001",
    "total": 25000,
    "montant_paye": 0,
    "montant_restant": 25000,
    "statut_paiement": "en_attente"
  }
}
```

### Étape 2 : Initiation du paiement mobile

Le système initie le paiement via l'opérateur mobile (Moov Money ou Airtel Money) pour le montant total.

### Étape 3 : Création immédiate de la transaction

**Dès que le paiement est initié**, une transaction est créée avec le statut `en_attente`.

```http
POST /api/v1/transactions
```

```json
{
  "commande_id": 1,
  "montant": 25000,
  "methode_paiement": "mobile_money",
  "type_paiement": "complet",
  "description": "Paiement complet de la commande",
  "numero_telephone": "06XXXXXXX",
  "reference_operateur": "BILL-123456"
}
```

**Réponse :**

```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "montant": 25000,
    "type_paiement": "complet",
    "statut": "paye"
  },
  "commande": {
    "id": 1,
    "total": 25000,
    "montant_paye": 25000,
    "montant_restant": 0,
    "statut_paiement": "paye"  // ✅ Commande entièrement payée
  }
}
```

### Résultat final

- ✅ Commande payée à 100%
- 📦 Prête pour l'expédition
- 💰 Aucun montant restant

---

## 📦 Flux 2 : Paiement à la Livraison

### Étape 1 : Création de la commande

```http
POST /api/v1/commandes
```

```json
{
  "boutique_id": 1,
  "client_nom": "Jean Dupont",
  "client_telephone": "+24166123456",
  "client_adresse": "Quartier Batterie IV",
  "client_ville": "Libreville",
  "client_commune": "Akanda",
  "frais_livraison": 2500,
  "articles": [
    {
      "produit_id": 5,
      "nom_produit": "T-Shirt",
      "prix_unitaire": 22500,
      "quantite": 1,
      "sous_total": 22500
    }
  ]
}
```

**Réponse :**

```json
{
  "success": true,
  "commande": {
    "id": 1,
    "numero_commande": "CMD-20250112-0001",
    "total": 25000,
    "montant_paye": 0,
    "montant_restant": 25000,
    "statut_paiement": "en_attente"
  }
}
```

### Étape 2 : Initiation du paiement des frais de livraison

Le système initie le paiement **uniquement pour les frais de livraison + frais de transaction**.

### Étape 3 : Création immédiate de la transaction

**Dès que le paiement est initié**, une transaction est créée avec le statut `en_attente`.

```http
POST /api/v1/transactions
```

```json
{
  "commande_id": 1,
  "montant": 2500,
  "methode_paiement": "mobile_money",
  "type_paiement": "frais_livraison",
  "description": "Paiement des frais de livraison",
  "numero_telephone": "06XXXXXXX",
  "reference_operateur": "BILL-123457"
}
```

**Réponse :**

```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "montant": 2500,
    "type_paiement": "frais_livraison",
    "statut": "paye"
  },
  "commande": {
    "id": 1,
    "total": 25000,
    "montant_paye": 2500,
    "montant_restant": 22500,
    "statut_paiement": "partiellement_paye"  // ⏳ Paiement partiel
  }
}
```

### Étape 4 : Vérification du paiement

Le système vérifie automatiquement le statut du paiement auprès de l'opérateur mobile. Une fois confirmé, le statut de la commande passe à `partiellement_paye`.

### Étape 5 : Après livraison - Solde du reste

**Cette étape est effectuée par l'administrateur après la livraison.**

```http
POST /api/v1/transactions
```

```json
{
  "commande_id": 1,
  "montant": 22500,
  "methode_paiement": "especes",
  "type_paiement": "solde_apres_livraison",
  "description": "Paiement du solde à la livraison"
}
```

**Réponse :**

```json
{
  "success": true,
  "transaction": {
    "id": 2,
    "montant": 22500,
    "type_paiement": "solde_apres_livraison",
    "statut": "paye"
  },
  "commande": {
    "id": 1,
    "total": 25000,
    "montant_paye": 25000,
    "montant_restant": 0,
    "statut_paiement": "paye"  // ✅ Commande entièrement payée
  }
}
```

### Résultat final

- ⏳ **Avant livraison** : Frais de livraison payés (2 500 FCFA)
- 📦 **Pendant livraison** : Produits livrés au client
- 💰 **Après livraison** : Solde payé en espèces (22 500 FCFA)
- ✅ **Final** : Commande entièrement payée (25 000 FCFA)

---

## 💡 Types de Paiement

| Type | Description | Quand l'utiliser |
|------|-------------|------------------|
| `complet` | Paiement total de la commande | Paiement immédiat complet |
| `frais_livraison` | Paiement des frais de livraison uniquement | Mode "Paiement à la livraison" activé |
| `solde_apres_livraison` | Paiement du reste après livraison | Après réception de la commande |

---

## 📊 Statuts de Paiement

| Statut | Description |
|--------|-------------|
| `en_attente` | Aucun paiement effectué |
| `partiellement_paye` | Frais de livraison payés, reste en attente |
| `paye` | Commande entièrement payée |

---

## 🔧 Implémentation Frontend

### Calcul des frais de transaction

```typescript
const getTransactionFee = () => {
  const transactionRate = 0.01; // 1%

  if (payOnDelivery) {
    // Pour paiement à la livraison : 1% seulement sur les frais de livraison
    return Math.round(deliveryFee * transactionRate);
  } else {
    // Pour paiement normal : 1% sur le total (sous-total + livraison)
    const baseAmount = subtotal + deliveryFee;
    return Math.round(baseAmount * transactionRate);
  }
};
```

### Calcul du montant à payer

```typescript
const getTotalToPay = () => {
  if (payOnDelivery) {
    return deliveryFee + getTransactionFee(); // Frais de livraison + frais de transaction
  }
  return subtotal + deliveryFee + getTransactionFee(); // Total complet
};
```

### Validation du formulaire

Dans les deux modes, le client **doit obligatoirement** :
- ✅ Sélectionner un mode de paiement (Moov Money ou Airtel Money)
- ✅ Saisir un numéro de téléphone valide
- ✅ Remplir l'adresse de livraison complète
- ✅ Sélectionner une commune

**Note importante** : Même en mode "Paiement à la livraison", un mode de paiement mobile est requis pour payer les frais de livraison.

---

## 🎯 Avantages par Mode

### Paiement Complet Immédiat
- ✅ Aucun risque pour le vendeur
- ✅ Livraison garantie
- ✅ Processus simplifié (1 paiement)
- ❌ Montant total requis immédiatement

### Paiement à la Livraison
- ✅ Faible engagement initial pour le client
- ✅ Client paie le reste seulement après réception
- ✅ Plus de confiance pour les nouveaux clients
- ⚠️ Nécessite 2 paiements
- ⚠️ Risque de refus à la livraison

---

## 📝 Notes Techniques

1. **Interface `CreerTransactionData`** mise à jour avec `type_paiement`
2. **Validation côté frontend** : Toujours exiger un mode de paiement
3. **Messages utilisateur** adaptés selon le mode choisi
4. **Gestion des erreurs** séparée pour chaque type de transaction
5. **Logs console** pour faciliter le débogage
6. **Création immédiate de la transaction** : La transaction est créée dès l'initiation du paiement (avec statut `en_attente`), puis mise à jour par le backend après vérification du paiement auprès de l'opérateur

---

## 🚀 Fichiers Modifiés

- `src/lib/services/transactions.ts` : Interfaces mises à jour
- `src/components/OrderSummary.tsx` : Logique de paiement adaptée
- `docs/FLUX-PAIEMENT.md` : Cette documentation

---

**Dernière mise à jour** : 12 Janvier 2025

