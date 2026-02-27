# Guide d'utilisation rapide - Formulaires de produits

## 🎯 Démarrage rapide

### Ajouter un produit en 3 étapes

1. **Cliquer sur "✨ Nouveau"** dans la page produits
2. **Choisir le type** : Vêtements, Chaussures ou Autres
3. **Remplir les 4 sections** du formulaire

---

## 📖 Scénarios d'utilisation

### Scénario 1 : Boutique de mode - T-shirts

**Produit** : T-shirt "Urban Style" disponible en 3 couleurs et 5 tailles

**Étapes** :

1. Clic sur "✨ Nouveau" → Sélection **"Vêtements"**

2. **Section 1** - Infos de base :
   ```
   Nom : T-shirt Urban Style
   Description : T-shirt en coton bio, coupe moderne, sérigraphie poitrine
   Catégorie : Mode Homme
   Statut : Actif
   ```

3. **Section 2** - Images :
   - Upload de 5 photos (noir face, noir dos, blanc face, gris face, détail)
   - Réorganisation : mettre la meilleure en première position

4. **Section 3** - Variants :
   
   **Variant 1 - Noir** :
   - Image : t-shirt noir face
   - Couleur : Noir
   - Tailles sélectionnées : S, M, L, XL, XXL
   - Stocks : S=10, M=15, L=12, XL=8, XXL=5
   - Prix : 12000 FCFA
   - Prix promo : 9000 FCFA
   - Stock total : 50 unités
   
   **Variant 2 - Blanc** :
   - Image : t-shirt blanc face
   - Couleur : Blanc
   - Tailles : S=8, M=12, L=10, XL=6
   - Prix : 12000 FCFA
   - Stock total : 36 unités
   
   **Variant 3 - Gris** :
   - Image : t-shirt gris face
   - Couleur : Gris chiné
   - Tailles : M=10, L=15, XL=8
   - Prix : 12000 FCFA
   - Stock total : 33 unités

5. **Section 4** - Personnalisations :
   ```
   [+] Broderie nom dans le dos
   Type : Texte
   Prix supplémentaire : 3000 FCFA
   Obligatoire : Non
   ```

6. **Enregistrer** → Le produit est créé avec :
   - Stock total : 119 unités
   - Prix affiché : 9000 FCFA (le prix promo du variant noir)
   - 3 variants visibles pour le client

---

### Scénario 2 : Magasin de sport - Baskets

**Produit** : Nike Air Zoom Pegasus en 2 coloris

**Étapes** :

1. Clic sur "✨ Nouveau" → Sélection **"Chaussures"**

2. **Section 1** :
   ```
   Nom : Nike Air Zoom Pegasus 40
   Description : Chaussures de running polyvalentes, amorti Zoom Air
   Catégorie : Chaussures Sport
   Statut : Actif
   ```

3. **Section 2** :
   - Upload de 6 photos (profil gauche, profil droit, dessus, semelle, détails x2)

4. **Section 3** - Variants :
   
   **Variant 1 - Noir/Blanc** :
   - Image : basket noire profil
   - Couleur : Noir/Blanc
   - Pointures : 40, 41, 42, 43, 44, 45
   - Stocks : 40=3, 41=5, 42=8, 43=6, 44=4, 45=2
   - Prix : 95000 FCFA
   - Stock total : 28 paires
   
   **Variant 2 - Bleu/Orange** :
   - Image : basket bleue profil
   - Couleur : Bleu/Orange
   - Pointures : 41, 42, 43, 44
   - Stocks : 41=4, 42=6, 43=5, 44=3
   - Prix : 95000 FCFA
   - Prix promo : 85000 FCFA
   - Stock total : 18 paires

5. **Section 4** : Aucune personnalisation

6. **Enregistrer** → Produit créé avec :
   - Stock total : 46 paires
   - Prix affiché : 85000 FCFA
   - 2 variants

---

### Scénario 3 : Boutique tech - Smartphones

**Produit** : Samsung Galaxy S24 en plusieurs stockages

**Étapes** :

1. Clic sur "✨ Nouveau" → Sélection **"Autres"**

2. **Section 1** :
   ```
   Nom : Samsung Galaxy S24
   Description : Smartphone 5G, écran AMOLED 6.2", Snapdragon 8 Gen 3
   Catégorie : Smartphones
   Statut : Actif
   ```

3. **Section 2** :
   - Upload de 5 photos (face, dos, profil, écran allumé, pack)

4. **Section 3** - Variants :
   
   **Variant 1** :
   - Image : galaxy noir
   - Attributs :
     - [Couleur] Noir
     - [Contenance] 128GB
   - Stock : 12 unités
   - Prix : 650000 FCFA
   
   **Variant 2** :
   - Image : galaxy noir
   - Attributs :
     - [Couleur] Noir
     - [Contenance] 256GB
   - Stock : 8 unités
   - Prix : 750000 FCFA
   
   **Variant 3** :
   - Image : galaxy violet
   - Attributs :
     - [Couleur] Violet
     - [Contenance] 256GB
   - Stock : 5 unités
   - Prix : 750000 FCFA
   - Prix promo : 700000 FCFA

5. **Section 4** :
   ```
   [+] Protection écran + coque
   Type : Nombre (quantité)
   Prix supplémentaire : 15000 FCFA
   Obligatoire : Non
   ```

6. **Enregistrer** → Produit créé avec :
   - Stock total : 25 unités
   - Prix affiché : 650000 FCFA

---

### Scénario 4 : Boutique beauté - Parfums

**Produit** : Chanel N°5 en différentes contenances

**Étapes** :

1. Sélection **"Autres"**

2. **Section 1** :
   ```
   Nom : Chanel N°5 Eau de Parfum
   Description : Parfum iconique, notes florales aldéhydées
   Catégorie : Parfums Femme
   Statut : Actif
   ```

3. **Section 2** :
   - Upload de 3 photos (flacon face, flacon avec boîte, ambiance)

4. **Section 3** - Variants :
   
   **Variant 1 - 50ml** :
   - Attributs : [Contenance] 50ml
   - Stock : 20
   - Prix : 85000 FCFA
   
   **Variant 2 - 100ml** :
   - Attributs : [Contenance] 100ml
   - Stock : 15
   - Prix : 135000 FCFA
   - Prix promo : 120000 FCFA

5. **Section 4** : Aucune personnalisation

6. **Enregistrer** → Stock total : 35 unités

---

### Scénario 5 : Magasin alimentation - Jus

**Produit** : Jus d'orange frais

**Étapes** :

1. Sélection **"Autres"**

2. **Section 1** :
   ```
   Nom : Jus d'Orange Pressé Maison
   Description : 100% pur jus, pressé le matin même, sans conservateur
   Catégorie : Boissons
   Statut : Actif
   ```

3. **Section 2** :
   - Upload de 2 photos (bouteille, verre servi)

4. **Section 3** - Variants :
   
   **Variant 1 - Petit** :
   - Attributs : [Contenance] 500ml
   - Stock : 50
   - Prix : 2000 FCFA
   
   **Variant 2 - Grand** :
   - Attributs : [Contenance] 1L
   - Stock : 30
   - Prix : 3500 FCFA

5. **Enregistrer** → Stock : 80 unités

---

## 🔄 Modifier un produit existant

### Exemple : Mise à jour des stocks

**Contexte** : Le t-shirt noir en taille M se vend bien, besoin de rajouter du stock

**Étapes** :

1. Dans la liste des produits, clic sur l'icône **"Modifier" (✏️)** du T-shirt Urban Style

2. Le formulaire s'ouvre automatiquement sur le bon type (Vêtements)
   - Toutes les données sont pré-remplies
   - Les images sont déjà chargées (URLs)

3. **Navigation jusqu'à Section 3** - Variants

4. Localiser **Variant 1 - Noir**

5. Dans la liste des tailles, trouver **M** et changer :
   ```
   Stock M : 15 → 25
   ```
   Le stock total du variant se met à jour automatiquement : 50 → 60

6. **Enregistrer** → Le produit est mis à jour

---

## 💰 Gestion des promotions

### Ajouter une promo sur un variant existant

**Étapes** :

1. Modifier le produit

2. Aller à **Section 3**

3. Sur le variant souhaité, renseigner **Prix promo** :
   ```
   Prix : 12000 FCFA
   Prix promo : 9000 FCFA  ← Ajout
   ```

4. Enregistrer

**Résultat** :
- Le prix affiché devient 9000 FCFA
- L'ancien prix (12000) est barré sur la fiche produit
- Le produit apparaît avec le badge "Promo"

---

## 🎨 Optimisation des images

### Bonnes pratiques

**Pour les vêtements** :
```
✅ Photo 1 : Vue de face, fond neutre
✅ Photo 2 : Vue de dos
✅ Photo 3 : Détail texture/motif
✅ Photo 4 : Porté (mannequin)
✅ Photo 5 : Variant couleur 2
```

**Pour les chaussures** :
```
✅ Photo 1 : Profil latéral, éclairage uniforme
✅ Photo 2 : Vue 3/4 avant
✅ Photo 3 : Vue dessus
✅ Photo 4 : Semelle
✅ Photo 5 : Détail matière
✅ Photo 6 : Porté
```

**Pour électronique** :
```
✅ Photo 1 : Produit seul, fond blanc
✅ Photo 2 : Emballage complet
✅ Photo 3 : Accessoires inclus
✅ Photo 4 : Vue écran/interface
✅ Photo 5 : Comparaison taille
```

---

## 📊 Tableau comparatif des formulaires

| Caractéristique | Vêtements | Chaussures | Autres |
|----------------|-----------|------------|--------|
| **Variants par** | Couleur | Couleur | Attributs libres |
| **Sous-divisions** | Tailles (XS-5XL) | Pointures (35-48) | Aucune |
| **Stock** | Par taille | Par pointure | Par variant |
| **Attributs max** | 2 (couleur + taille) | 2 (couleur + pointure) | Illimité |
| **Types attributs** | Fixe | Fixe | Couleur, Taille, Contenance |
| **Cas d'usage** | Mode textile | Chaussures | Électro, beauté, alimentaire |

---

## 🚨 Erreurs fréquentes

### "Au moins une image est requise"
**Cause** : Tentative de passer à la section 3 sans image  
**Solution** : Ajouter au moins 1 photo en section 2

### "Au moins un variant est requis"
**Cause** : Section 3 vide  
**Solution** : Cliquer sur "Ajouter un variant" et le remplir

### "Prix promo doit être inférieur au prix normal"
**Cause** : Prix promo >= prix de base  
**Solution** : Vérifier que prix promo < prix normal

### "Au moins une taille/pointure/attribut est requis"
**Cause** : Variant sans déclinaison  
**Solution** : Sélectionner au moins une taille/pointure ou ajouter un attribut

---

## ⚡ Raccourcis et astuces

### Dupliquer un variant similaire
1. Créer le variant 1 avec toutes ses infos
2. Cliquer sur "Ajouter un variant"
3. Modifier uniquement la couleur et l'image
4. Garder les mêmes tailles/pointures et prix

### Remplissage rapide des stocks
- Utiliser la touche **Tab** pour naviguer entre les champs
- Saisir rapidement les stocks de chaque taille/pointure

### Image principale
- La première image uploadée devient automatiquement l'image principale
- Réorganiser en glissant-déposant pour changer

### Brouillon automatique
- Le formulaire sauvegarde automatiquement en brouillon
- Fermer et rouvrir : le système propose de restaurer
- Expiration : 1 heure

---

## 📱 Responsive - Différences mobile/desktop

### Sur mobile

**Textes raccourcis** :
- "Ajouter un variant" → "Ajouter"
- "Enregistrer le produit" → "Enregistrer"
- "Précédent" → "Préc."
- "Suivant" → "Suiv."

**Contrôles images** :
- Toujours visibles (pas besoin de hover)
- Disposés verticalement

**Grille variants** :
- 4 colonnes d'images (au lieu de 6)
- Stack vertical des champs

### Sur desktop

**Contrôles images** :
- Visibles au survol
- Transitions fluides

**Navigation** :
- Noms complets des sections visibles
- Grille 6 colonnes pour sélection d'images

---

## 🎓 Formation vendeur

### Checklist avant d'ajouter un produit

- [ ] Photos de qualité prêtes (min. 3)
- [ ] Informations produit complètes
- [ ] Stock vérifié
- [ ] Prix déterminé
- [ ] Catégorie identifiée dans la BDD

### Temps estimé par type

- **Vêtement simple** (1 couleur, 3 tailles) : ~5 min
- **Vêtement complet** (3 couleurs, 5 tailles) : ~10 min
- **Chaussures** (2 couleurs, 6 pointures) : ~8 min
- **Produit générique** (2-3 variants) : ~5 min

### Formation recommandée

1. **Jour 1** : Vêtements simples (1 couleur)
2. **Jour 2** : Vêtements multi-couleurs
3. **Jour 3** : Chaussures
4. **Jour 4** : Produits génériques
5. **Jour 5** : Modifications et promotions

---

## 🔗 Liens utiles

- [Documentation complète](./FORMULAIRES_PRODUITS.md)
- [Guide d'édition](./FORMULAIRES_PRODUITS.md#gestion-de-lédition)
- [Format des données](./FORMULAIRES_PRODUITS.md#structure-des-données)
- [Exemples détaillés](./FORMULAIRES_PRODUITS.md#exemples-de-produits-usuels)
