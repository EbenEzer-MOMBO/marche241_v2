# Modèle Logique de Données - Marché 241

## Vue d'ensemble

Ce document décrit le modèle logique de données pour la plateforme e-commerce multi-boutiques Marché 241. Le système permet à des vendeurs de créer leurs boutiques en ligne et de vendre leurs produits.

## Principe de base

- **Identification des vendeurs** : Les vendeurs sont identifiés uniquement par leur numéro de téléphone
- **Email optionnel** : L'adresse email est facultative pour les vendeurs
- **Multi-boutiques** : Un vendeur peut avoir plusieurs boutiques
- **Gestion des stocks** : Suivi en temps réel des stocks et des ventes

## Tables principales

### 1. Table `vendeurs`

**Rôle** : Stocke les informations des vendeurs qui gèrent les boutiques.

**Champs principaux** :
- `telephone` (UNIQUE) : Identifiant principal du vendeur
- `email` (NULL) : Adresse email optionnelle
- `statut` : État du compte (actif, inactif, suspendu)
- `verification_telephone` : Statut de vérification du numéro

**Relations** :
- Un vendeur peut avoir plusieurs boutiques (1:N)

### 2. Table `boutiques`

**Rôle** : Représente les boutiques en ligne des vendeurs.

**Champs principaux** :
- `slug` : Identifiant URL unique (ex: boutique-de-joline)
- `couleur_primaire/secondaire` : Personnalisation visuelle
- `horaires_ouverture` : Stockage JSON des horaires
- `statut` : État de la boutique (active, en_attente, etc.)

**Relations** :
- Appartient à un vendeur (N:1)
- Contient plusieurs produits (1:N)
- Reçoit plusieurs commandes (1:N)

### 3. Table `categories`

**Rôle** : Classification hiérarchique des produits.

**Champs principaux** :
- `parent_id` : Permet la création de sous-catégories
- `icone` : Emoji ou nom d'icône pour l'affichage
- `ordre_affichage` : Contrôle l'ordre d'affichage

**Relations** :
- Structure hiérarchique (auto-référence)
- Contient plusieurs produits (1:N)

### 4. Table `produits`

**Rôle** : Catalogue des produits vendus dans les boutiques.

**Champs principaux** :
- `prix` : Stocké en centimes pour éviter les erreurs de virgule flottante
- `variants` : JSON pour les variantes (couleur, taille, etc.)
- `images` : Tableau JSON des URLs d'images
- `dimensions` : JSON pour longueur, largeur, hauteur
- `tags` : Mots-clés pour la recherche

**Relations** :
- Appartient à une boutique (N:1)
- Appartient à une catégorie (N:1)
- Peut avoir plusieurs avis (1:N)
- Peut être dans plusieurs commandes (N:N via commande_articles)

### 5. Table `commandes`

**Rôle** : Gestion des commandes passées par les clients.

**Champs principaux** :
- `numero_commande` : Format standardisé (CMD-2024-001234)
- Informations client complètes
- Montants en centimes (sous_total, frais_livraison, taxes, total)
- Statuts séparés pour la commande et le paiement
- Dates de suivi (commande, confirmation, expédition, livraison)

**Relations** :
- Appartient à une boutique (N:1)
- Contient plusieurs articles (1:N)
- Peut générer des avis (1:N)

### 6. Table `commande_articles`

**Rôle** : Détails des produits dans chaque commande.

**Champs principaux** :
- `nom_produit` : Sauvegarde du nom au moment de la commande
- `prix_unitaire` : Prix au moment de la commande (historique)
- `variants_selectionnes` : JSON des variantes choisies

**Relations** :
- Appartient à une commande (N:1)
- Référence un produit (N:1)

## Tables secondaires

### 7. Table `avis_produits`

**Rôle** : Système d'évaluation des produits par les clients.

**Fonctionnalités** :
- Notes de 1 à 5 étoiles
- Modération des avis
- Lien avec les commandes pour vérifier les achats

### 8. Table `paniers`

**Rôle** : Gestion des paniers pour les sessions non connectées.

**Fonctionnalités** :
- Stockage temporaire des articles
- Gestion par session_id
- Nettoyage automatique possible

## Vues et optimisations

### Vues créées

1. **`vue_produits_complets`** : Produits avec informations de boutique et vendeur
2. **`vue_commandes_resume`** : Commandes avec totaux et informations vendeur

### Index de performance

- Index sur les champs de recherche fréquents
- Index composites pour les requêtes complexes
- Index sur les clés étrangères

### Triggers automatiques

- Mise à jour du nombre de produits par boutique
- Calcul automatique des notes moyennes
- Mise à jour des compteurs d'avis

## Règles de gestion

### Vendeurs
- Identification unique par numéro de téléphone
- Email optionnel mais recommandé
- Vérification du téléphone obligatoire

### Boutiques
- Slug unique pour les URLs
- Statut "en_attente" par défaut (modération)
- Personnalisation des couleurs

### Produits
- Prix en centimes pour la précision
- Gestion des variantes flexible (JSON)
- Statut "brouillon" par défaut
- SKU optionnel mais recommandé

### Commandes
- Numérotation automatique unique
- Sauvegarde des prix au moment de la commande
- Statuts séparés pour commande et paiement
- Traçabilité complète des dates

## Sécurité et intégrité

### Contraintes
- Prix positifs obligatoires
- Quantités positives
- Notes entre 1 et 5
- Références d'intégrité avec CASCADE/RESTRICT appropriés

### Suppression en cascade
- Vendeur supprimé → Boutiques supprimées
- Boutique supprimée → Produits supprimés
- Commande supprimée → Articles supprimés

### Protection des données
- Restriction sur suppression des catégories avec produits
- Restriction sur suppression des produits avec commandes
- Conservation de l'historique des commandes

## Évolutivité

### Extensions possibles
- Table des coupons de réduction
- Système de fidélité
- Gestion des retours/remboursements
- Système de notifications
- Analytics et rapports avancés

### Optimisations futures
- Partitioning des tables par date
- Cache Redis pour les données fréquentes
- Réplication en lecture seule
- Archivage des anciennes commandes

## Utilisation avec l'application

Les types TypeScript correspondants sont définis dans `src/lib/database-types.ts` pour une intégration parfaite avec le code de l'application Next.js.

Les données de test sont disponibles dans `src/lib/products.ts` et utilisent les types définis dans `src/lib/types.ts`.