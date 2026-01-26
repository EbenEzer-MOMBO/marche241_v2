# Composants Landing Page Marché241

Ce dossier contient tous les composants de la landing page moderne de Marché241.

## Structure

### 1. HeroBanner.tsx
Composant de la section héro/banner principal avec :
- Titre et sous-titre accrocheurs
- Description de la plateforme
- Boutons CTA (Call-to-Action)
- Statistiques rapides (500+ boutiques, 10k+ produits, support 24/7)
- Image illustrative avec effet de fond animé
- Design responsive et animations au scroll

### 2. FeaturesSection.tsx
Section présentant les 6 fonctionnalités principales :
- Gestion des commandes simplifiée
- Paiements mobiles intégrés (Airtel Money, Moov Money)
- Statistiques en temps réel
- Sécurité et fiabilité
- Déploiement rapide
- Support dédié

Chaque fonctionnalité a :
- Une icône distinctive
- Un numéro
- Un titre et une description
- Effet hover avec bordure verte et ombre

### 3. NewsletterSection.tsx
Section d'inscription à la newsletter avec :
- Formulaire d'email
- Validation en temps réel
- Message de confirmation
- Design sur fond vert dégradé

### 4. AboutSection.tsx
Section "À propos" avec deux parties :
- Première partie : Plateforme pensée pour le Gabon (image à gauche)
- Deuxième partie : Optimisation des ventes (image à droite)
- Liste de points forts avec icônes
- Design alterné pour une lecture fluide

### 5. ScreenshotsSection.tsx
Carrousel de captures d'écran avec :
- Navigation précédent/suivant
- Effet de flou sur les images adjacentes
- Indicateurs de position
- Overlay avec titre et description
- Design sombre avec contraste blanc

### 6. PricingSection.tsx
Section des tarifs avec 3 plans :
- **Starter** : Gratuit (pour débuter)
- **Business** : 25 000 FCFA/mois (le plus populaire)
- **Enterprise** : Sur mesure

Chaque plan affiche :
- Liste de fonctionnalités avec icônes ✓ ou ✗
- Prix et période
- Bouton CTA personnalisé
- Badge "Le plus populaire" pour le plan Business

### 7. CTASection.tsx
Section finale d'appel à l'action avec :
- Message motivant
- Statistiques impressionnantes
- Deux boutons CTA
- Design sur fond vert avec effet glassmorphism

## Utilisation

```tsx
import { HeroBanner } from '@/components/landing/HeroBanner';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
// ... autres imports

export default function LandingPage() {
  return (
    <main>
      <HeroBanner />
      <FeaturesSection />
      <NewsletterSection />
      <AboutSection />
      <ScreenshotsSection />
      <PricingSection />
      <CTASection />
    </main>
  );
}
```

## Personnalisation

Tous les composants acceptent des props pour personnaliser le contenu :

```tsx
<HeroBanner
  title="Votre titre personnalisé"
  subtitle="Votre sous-titre"
  description="Votre description"
  ctaText="Texte du bouton"
  ctaLink="/votre-lien"
  imageSrc="/votre-image.png"
/>
```

## Style

- Framework CSS : **Tailwind CSS**
- Icônes : **Lucide React**
- Animations : CSS transitions + Tailwind
- Responsive : Mobile-first design
- Couleurs principales : Vert (#10b981), Noir (#000000)

## Accessibilité

- Boutons avec aria-labels appropriés
- Navigation au clavier supportée
- Contraste suffisant pour la lisibilité
- Images avec alt text descriptif
