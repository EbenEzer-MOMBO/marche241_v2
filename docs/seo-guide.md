# Guide SEO - Marché241

## Configuration du référencement

### 1. Métadonnées principales

Les métadonnées sont configurées dans `src/app/layout.tsx` et incluent :

- **Title** : Titre dynamique avec template
- **Description** : Description optimisée pour les moteurs de recherche
- **Keywords** : Mots-clés pertinents pour le marché gabonais
- **Open Graph** : Métadonnées pour le partage sur les réseaux sociaux
- **Twitter Cards** : Optimisation pour Twitter
- **Robots** : Instructions pour les crawlers

### 2. Fichiers générés automatiquement

#### `robots.txt`
Fichier situé dans `/public/robots.txt` qui guide les moteurs de recherche.

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://marche241.com/sitemap.xml
```

#### `sitemap.xml`
Généré automatiquement via `src/app/sitemap.ts`. Accessible à `/sitemap.xml`

#### `manifest.json`
Configuration PWA dans `src/app/manifest.ts`. Accessible à `/manifest.json`

### 3. Données structurées (JSON-LD)

Les données structurées sont définies dans `src/components/StructuredData.tsx` et incluent :

- **WebSite** : Informations sur le site
- **Organization** : Informations sur l'entreprise
- **BreadcrumbList** : Navigation en fil d'Ariane

### 4. Configuration requise

#### Variables d'environnement

Créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SITE_URL=https://marche241.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=votre-code
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Google Search Console

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété (domaine ou URL)
3. Vérifiez la propriété avec la balise meta
4. Mettez à jour `verification.google` dans `layout.tsx`

#### Google Analytics

1. Créez un compte sur [Google Analytics](https://analytics.google.com)
2. Obtenez votre ID de mesure (G-XXXXXXXXXX)
3. Ajoutez-le dans `.env.local`
4. Intégrez le script dans votre application

### 5. Checklist SEO

#### ✅ Configuration de base
- [x] Métadonnées complètes
- [x] robots.txt
- [x] sitemap.xml
- [x] manifest.json
- [x] Données structurées (JSON-LD)
- [x] Open Graph tags
- [x] Twitter Cards

#### 📝 À configurer
- [ ] Google Search Console
- [ ] Google Analytics
- [ ] Codes de vérification
- [ ] Liens réseaux sociaux
- [ ] Image Open Graph optimisée (1200x630px)

#### 🎯 Optimisations avancées
- [ ] Page 404 personnalisée
- [ ] Temps de chargement < 3s
- [ ] Images optimisées (WebP)
- [ ] Lazy loading des images
- [ ] Compression Gzip/Brotli
- [ ] Cache headers optimisés
- [ ] SSL/HTTPS activé
- [ ] Mobile-friendly (responsive)

### 6. Mots-clés principaux

Focus sur ces mots-clés pour le marché gabonais :

- boutique en ligne Gabon
- e-commerce Gabon
- vente en ligne Libreville
- marketplace Gabon
- mobile money Gabon
- Airtel Money
- Moov Money
- commerce électronique Gabon

### 7. Recommandations

#### Contenu
- Créez du contenu unique et pertinent
- Mettez à jour régulièrement les produits
- Ajoutez des descriptions détaillées
- Utilisez des images de qualité

#### Technique
- Vérifiez la vitesse de chargement (PageSpeed Insights)
- Assurez-vous que le site est responsive
- Utilisez HTTPS
- Optimisez les Core Web Vitals

#### Liens
- Obtenez des backlinks de sites gabonais
- Partagez sur les réseaux sociaux
- Créez des partenariats locaux
- Inscrivez-vous dans les annuaires

### 8. Outils utiles

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Schema.org Validator](https://validator.schema.org)
- [Open Graph Debugger](https://www.opengraph.xyz)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 9. Surveillance

Surveillez régulièrement :
- Positions dans les résultats de recherche
- Trafic organique
- Taux de rebond
- Temps de chargement
- Erreurs d'indexation
- Backlinks

### 10. Mises à jour

Le référencement est un processus continu. Pensez à :
- Analyser les performances mensuellement
- Mettre à jour les mots-clés selon les tendances
- Créer du contenu frais régulièrement
- Corriger les erreurs signalées par Search Console
- Suivre les mises à jour des algorithmes Google

---

Pour toute question, consultez la [documentation Next.js SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

