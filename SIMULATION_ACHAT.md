# 📊 Simulation d'Achat - Marché241

## 💰 Structure des Frais

### Répartition des frais de commodité (4,5%)
- **Ebilling entrée** : 2,5% (prestataire de paiement - collecte)
- **Ebilling sortie** : 1% (prestataire de paiement - versement)
- **Marché241** : 1% (notre commission)
- **Total facturé au client** : 4,5%

---

## 🛍️ SCÉNARIO 1 : Paiement Mobile Money (Airtel/Moov)

### Détails de la commande
```
Produit A : 15 000 FCFA x 2 = 30 000 FCFA
Produit B : 8 000 FCFA x 1  =  8 000 FCFA
                    Sous-total = 38 000 FCFA
              Frais de livraison =  2 000 FCFA
                    ─────────────────────────
              Total avant frais = 40 000 FCFA
```

### Calcul des frais (3% sur total)
```
Frais de transaction (3%) = 40 000 × 0,03 = 1 200 FCFA
                    ─────────────────────────
              TOTAL À PAYER = 41 200 FCFA
```

### Répartition des frais de transaction
| Acteur | Montant | Calcul |
|--------|---------|--------|
| **Ebilling** | 1 000 FCFA | 40 000 × 2,5% |
| **Marché241** | 200 FCFA | 40 000 × 0,5% |
| **Total** | 1 200 FCFA | 40 000 × 3% |

### Flux financier
```
Client paie via Airtel/Moov : 41 200 FCFA
    ↓
Ebilling traite le paiement
    ├─→ Ebilling garde    : 1 000 FCFA (2,5%)
    ├─→ Marché241 reçoit  :   200 FCFA (0,5%)
    └─→ Boutique reçoit   : 40 000 FCFA
```

### Bilan pour la boutique
| Élément | Montant |
|---------|---------|
| Montant articles | 38 000 FCFA |
| Frais de livraison | 2 000 FCFA |
| **Total reçu** | **40 000 FCFA** |

✅ **La boutique reçoit l'intégralité de sa commande (produits + livraison)**

---

## 🚚 SCÉNARIO 2 : Paiement à la Livraison

### Détails de la commande
```
Produit A : 15 000 FCFA x 2 = 30 000 FCFA
Produit B : 8 000 FCFA x 1  =  8 000 FCFA
                    Sous-total = 38 000 FCFA
              Frais de livraison =  2 000 FCFA
```

### Calcul des frais (3% sur frais de livraison uniquement)
```
Frais de transaction (3%) = 2 000 × 0,03 = 60 FCFA
              Frais de livraison =  2 000 FCFA
                    ─────────────────────────
    TOTAL À PAYER EN LIGNE = 2 060 FCFA
```

### Répartition des frais de transaction
| Acteur | Montant | Calcul |
|--------|---------|--------|
| **Ebilling** | 50 FCFA | 2 000 × 2,5% |
| **Marché241** | 10 FCFA | 2 000 × 0,5% |
| **Total** | 60 FCFA | 2 000 × 3% |

### Flux financier - Paiement en ligne
```
Client paie en ligne via Airtel/Moov : 2 060 FCFA
    ↓
Ebilling traite le paiement
    ├─→ Ebilling garde    :   50 FCFA (2,5%)
    ├─→ Marché241 reçoit  :   10 FCFA (0,5%)
    └─→ Boutique reçoit   : 2 000 FCFA (frais livraison)
```

### Flux financier - À la livraison
```
Livreur collecte : 38 000 FCFA (paiement cash)
    ↓
Boutique reçoit : 38 000 FCFA
```

### Bilan pour la boutique
| Élément | Montant | Mode |
|---------|---------|------|
| Montant articles | 38 000 FCFA | Cash à la livraison |
| Frais de livraison | 2 000 FCFA | Payé en ligne |
| **Total reçu** | **40 000 FCFA** | - |

✅ **La boutique reçoit l'intégralité de sa commande (produits + livraison)**

---

## 📈 SCÉNARIO 3 : Commande de Grande Valeur

### Détails de la commande
```
Produit Premium A : 250 000 FCFA x 1 = 250 000 FCFA
Produit Premium B : 180 000 FCFA x 1 = 180 000 FCFA
Produit C         :  45 000 FCFA x 2 =  90 000 FCFA
                         Sous-total = 520 000 FCFA
                   Frais de livraison =   3 000 FCFA
                         ─────────────────────────
                   Total avant frais = 523 000 FCFA
```

### Calcul des frais (3% sur total)
```
Frais de transaction (3%) = 523 000 × 0,03 = 15 690 FCFA
                         ─────────────────────────
                   TOTAL À PAYER = 538 690 FCFA
```

### Répartition des frais de transaction
| Acteur | Montant | Calcul |
|--------|---------|--------|
| **Ebilling** | 13 075 FCFA | 523 000 × 2,5% |
| **Marché241** | 2 615 FCFA | 523 000 × 0,5% |
| **Total** | 15 690 FCFA | 523 000 × 3% |

### Bilan pour la boutique
| Élément | Montant |
|---------|---------|
| Montant articles | 520 000 FCFA |
| Frais de livraison | 3 000 FCFA |
| **Total reçu** | **523 000 FCFA** |

### Revenus Marché241
```
Commission (0,5%) = 2 615 FCFA par commande
```

---

## 💡 COMPARAISON DES SCÉNARIOS

| Scénario | Sous-total | Frais livraison | Total base | Frais transaction | Total final | Commission Marché241 |
|----------|-----------|----------------|------------|-------------------|-------------|---------------------|
| **Paiement mobile** | 38 000 FCFA | 2 000 FCFA | 40 000 FCFA | 1 200 FCFA | 41 200 FCFA | 200 FCFA |
| **Paiement livraison** | 38 000 FCFA | 2 000 FCFA | 40 000 FCFA | 60 FCFA | 40 060 FCFA* | 10 FCFA |
| **Grande commande** | 520 000 FCFA | 3 000 FCFA | 523 000 FCFA | 15 690 FCFA | 538 690 FCFA | 2 615 FCFA |

*Plus 38 000 FCFA en cash à la livraison

---

## 🎯 AVANTAGES DU MODÈLE

### Pour le client
✅ **Transparence** : Les frais sont clairement affichés (3%)
✅ **Flexibilité** : Choix entre paiement mobile ou cash à la livraison
✅ **Sécurité** : Paiement mobile money sécurisé via Ebilling

### Pour la boutique
✅ **Pas de frais cachés** : Reçoit 100% du montant (produits + livraison)
✅ **Paiement garanti** : Les frais de livraison sont prépayés
✅ **Zéro risque** : En paiement à la livraison, les frais sont couverts

### Pour Marché241
✅ **Commission fixe** : 0,5% sur chaque transaction
✅ **Scalabilité** : Plus de volume = plus de revenus
✅ **Modèle viable** : Couvre les coûts d'infrastructure et de support

---

## 📊 PROJECTION MENSUELLE

### Hypothèse : 100 commandes/mois
```
Panier moyen : 40 000 FCFA
Frais transaction moyen : 1 200 FCFA
Commission Marché241 par commande : 200 FCFA

Revenus mensuels Marché241 : 100 × 200 = 20 000 FCFA
Revenus annuels Marché241 : 20 000 × 12 = 240 000 FCFA
```

### Hypothèse : 500 commandes/mois
```
Panier moyen : 40 000 FCFA
Commission Marché241 par commande : 200 FCFA

Revenus mensuels Marché241 : 500 × 200 = 100 000 FCFA
Revenus annuels Marché241 : 100 000 × 12 = 1 200 000 FCFA
```

### Hypothèse : 1000 commandes/mois (objectif)
```
Panier moyen : 40 000 FCFA
Commission Marché241 par commande : 200 FCFA

Revenus mensuels Marché241 : 1000 × 200 = 200 000 FCFA
Revenus annuels Marché241 : 200 000 × 12 = 2 400 000 FCFA
```

---

## 🔑 POINTS CLÉS

1. **Client transparent** : Le client voit exactement ce qu'il paie (3% de frais)
2. **Boutique protégée** : Reçoit 100% de son CA sans surprise
3. **Marché241 viable** : 0,5% de commission sur toutes les transactions
4. **Ebilling couvert** : 2,5% pour le traitement des paiements
5. **Win-Win-Win** : Modèle équitable pour toutes les parties

---

## 🚀 RECOMMANDATIONS

### Court terme (0-3 mois)
- ✅ Maintenir les frais à **3%** pour la stabilité
- ✅ Communiquer clairement sur la structure des frais
- ✅ Optimiser le taux de conversion pour augmenter le volume

### Moyen terme (3-6 mois)
- 📊 Analyser les données réelles (panier moyen, volume)
- 🎯 Identifier les opportunités d'optimisation
- 💡 Envisager des paliers de volume (0-100, 100-500, 500+)

### Long terme (6-12 mois)
- 💰 Possible réduction à **2,5%** si volume élevé
- 🤝 Négociation avec Ebilling sur les frais (économies d'échelle)
- 🌟 Programme de fidélité pour boutiques à fort volume

---

**Date de simulation** : 19 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Frais mis à jour à 3% dans le code

