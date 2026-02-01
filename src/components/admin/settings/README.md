# Composants de la page Paramètres

Ce dossier contient les composants extraits de la page des paramètres admin pour une meilleure organisation et maintenabilité du code.

## Structure

### 1. ProfilSection.tsx
Composant pour la gestion du profil vendeur.

**Props:**
- `profilData`: Données du profil (nom, email, téléphone, ville)
- `setProfilData`: Fonction pour mettre à jour les données
- `onSave`: Callback pour sauvegarder les modifications
- `isSaving`: État de sauvegarde en cours

**Fonctionnalités:**
- Formulaire d'édition du profil vendeur
- Validation des champs
- Input téléphone avec composant personnalisé
- Bouton de sauvegarde avec état de chargement

### 2. ImageUploadSection.tsx
Composant pour l'upload du logo et de la bannière de la boutique.

**Props:**
- `logoUrl`: URL du logo actuel
- `banniereUrl`: URL de la bannière actuelle
- `isUploadingLogo`: État d'upload du logo
- `isUploadingBanniere`: État d'upload de la bannière
- `onLogoChange`: Handler pour le changement de logo
- `onBanniereChange`: Handler pour le changement de bannière

**Fonctionnalités:**
- Aperçu des images (logo rond, bannière 16:9)
- Upload avec validation (type, taille max 5MB)
- Indicateurs de progression pendant l'upload
- Icônes par défaut si pas d'image

### 3. BoutiqueInfoSection.tsx
Composant pour les informations générales de la boutique.

**Props:**
- `boutiqueData`: Données de la boutique (nom, slug, description, adresse, téléphone)
- `setBoutiqueData`: Fonction pour mettre à jour les données

**Fonctionnalités:**
- Formulaire des informations de la boutique
- Slug en lecture seule avec préfixe du domaine
- Textarea pour la description
- Inputs validés pour adresse et téléphone

### 4. ApparenceSection.tsx
Composant pour la personnalisation de l'apparence de la boutique.

**Props:**
- `couleurPrimaire`: Couleur primaire actuelle
- `couleurSecondaire`: Couleur secondaire actuelle
- `onChangePrimaire`: Handler pour changement couleur primaire
- `onChangeSecondaire`: Handler pour changement couleur secondaire

**Fonctionnalités:**
- Sélecteurs de couleurs (désactivés pour l'instant)
- Inputs texte pour les codes hexadécimaux
- Message informatif sur la fonctionnalité à venir

## Utilisation

```tsx
import { ProfilSection } from '@/components/admin/settings/ProfilSection';
import { ImageUploadSection } from '@/components/admin/settings/ImageUploadSection';
import { BoutiqueInfoSection } from '@/components/admin/settings/BoutiqueInfoSection';
import { ApparenceSection } from '@/components/admin/settings/ApparenceSection';

// Dans votre composant parent
<ProfilSection
  profilData={profilData}
  setProfilData={setProfilData}
  onSave={handleSaveProfil}
  isSaving={isSaving}
/>
```

## Avantages de cette organisation

1. **Meilleure lisibilité**: Code plus court et plus facile à comprendre
2. **Réutilisabilité**: Les composants peuvent être réutilisés ailleurs
3. **Maintenabilité**: Modifications plus faciles et isolées
4. **Tests**: Plus simple à tester individuellement
5. **Performance**: Possibilité d'optimiser chaque composant séparément

## Notes

- Tous les composants utilisent TypeScript pour la sécurité des types
- Les styles utilisent Tailwind CSS
- Les composants sont compatibles avec les hooks React
