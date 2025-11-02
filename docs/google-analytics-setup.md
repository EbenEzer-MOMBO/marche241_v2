# Configuration Google Analytics - Marché241

## 📊 Où ajouter votre Google Tag ?

Le Google Tag (Google Analytics) est **déjà intégré** dans votre application via le composant `GoogleAnalytics` situé dans `src/components/GoogleAnalytics.tsx`.

### ✅ Configuration actuelle

- ✅ Composant Google Analytics créé
- ✅ Intégré dans le layout principal (`src/app/layout.tsx`)
- ✅ Chargement optimisé avec `next/script`
- ✅ Désactivé en mode développement (pour éviter les faux comptages)

## 🚀 Comment activer Google Analytics

### Étape 1 : Obtenez votre ID Google Analytics

1. Allez sur [Google Analytics](https://analytics.google.com)
2. Connectez-vous avec votre compte Google
3. Créez une **nouvelle propriété** ou utilisez une existante
4. Choisissez **GA4** (Google Analytics 4)
5. Copiez votre **ID de mesure** qui ressemble à : `G-XXXXXXXXXX`

### Étape 2 : Ajoutez votre ID dans votre fichier `.env.local`

Créez ou modifiez le fichier `.env.local` à la racine de votre projet :

```env
# URL de base de l'API
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.14:3000/api/v1

# Configuration de l'application
NEXT_PUBLIC_APP_NAME=Marche241
NEXT_PUBLIC_APP_VERSION=2.0

# URL du site (pour le SEO et les métadonnées)
NEXT_PUBLIC_SITE_URL=https://marche241.ga

# SEO & Analytics
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=yZvhvdtxhMYsvL0wzq875n2A6JRylIAtBwf9YP9seJU
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-VOTRE-ID-ICI

# Mode de développement
# NODE_ENV=development
```

**Important :** Remplacez `G-VOTRE-ID-ICI` par votre vrai ID Google Analytics.

### Étape 3 : Redémarrez votre serveur de développement

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run dev
```

### Étape 4 : Vérifiez que ça fonctionne

1. Ouvrez votre site en production (pas en développement)
2. Ouvrez les **DevTools** de votre navigateur (F12)
3. Allez dans l'onglet **Console**
4. Vous devriez voir des requêtes vers `googletagmanager.com`
5. Dans Google Analytics, allez dans **Rapports > Temps réel**
6. Vous devriez voir votre visite en temps réel

## 🔍 Détails techniques

### Emplacement des fichiers

```
src/
├── app/
│   └── layout.tsx          # Le Google Tag est appelé ici
└── components/
    └── GoogleAnalytics.tsx  # Logique du Google Tag
```

### Code du composant GoogleAnalytics

```typescript:21:32:src/components/GoogleAnalytics.tsx
import Script from 'next/script';

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  // Ne pas charger en développement ou si l'ID n'est pas configuré
  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

### Intégration dans le layout

```typescript:109:115:src/app/layout.tsx
<body
  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
>
  <GoogleAnalytics />
  {children}
</body>
```

## 📝 Notes importantes

### Environnements

- **Développement** : Google Analytics est **désactivé** automatiquement
- **Production** : Google Analytics s'active **uniquement** si l'ID est configuré

### Variables d'environnement

Le fichier `.env.local` est **ignoré par git** (sécurité). Chaque développeur doit créer le sien.

Pour la production, configurez les variables d'environnement directement sur votre plateforme d'hébergement :

#### Vercel
1. Allez dans **Settings > Environment Variables**
2. Ajoutez `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` avec votre ID

#### Netlify
1. Allez dans **Site settings > Environment variables**
2. Ajoutez `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` avec votre ID

#### Autres plateformes
Consultez la documentation de votre hébergeur pour ajouter des variables d'environnement.

## 🎯 Événements personnalisés (optionnel)

Pour suivre des événements personnalisés (ex: ajout au panier, commande), vous pouvez créer un helper :

```typescript
// src/lib/analytics.ts
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Utilisation
trackEvent('add_to_cart', 'ecommerce', 'Product Name', 29.99);
```

## ✅ Checklist de configuration

- [ ] Créé un compte Google Analytics
- [ ] Obtenu l'ID de mesure (G-XXXXXXXXXX)
- [ ] Ajouté l'ID dans `.env.local`
- [ ] Redémarré le serveur de développement
- [ ] Testé en production
- [ ] Vérifié les données en temps réel dans Google Analytics
- [ ] Configuré les événements personnalisés (optionnel)

## 🆘 Dépannage

### Le Google Tag ne se charge pas

1. Vérifiez que vous êtes en mode **production** (`NODE_ENV=production`)
2. Vérifiez que `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` est bien défini
3. Vérifiez qu'il n'y a pas de bloqueur de publicités actif
4. Ouvrez la console du navigateur pour voir les erreurs

### Les données n'apparaissent pas dans Google Analytics

1. Attendez quelques minutes (délai de traitement)
2. Vérifiez dans **Rapports > Temps réel** d'abord
3. Assurez-vous que l'ID est correct
4. Vérifiez que le domaine est bien configuré dans GA4

## 📚 Ressources

- [Documentation Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [Guide Google Tag Manager](https://support.google.com/tagmanager)

---

Pour toute question, consultez la documentation officielle ou contactez le support.

